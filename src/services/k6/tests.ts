import { readFile } from 'fs/promises'

import {
  CloudTest,
  CloudTestSchema,
  ListCloudTestsPage,
  ListCloudTestsPageSchema,
  ListCloudTestsSchema,
  StartCloudTestRun,
  StartCloudTestRunSchema,
} from './schemas'
import { CloudCredentials, CloudRequest } from './types'
import { getHeaders, parse, url } from './utils'

interface GetByTestNameArgs extends CloudRequest {
  projectId: number
  name: string
}

interface RunTestArgs extends CloudRequest {
  testId: number
}

interface ListTestsInProjectArgs extends CloudRequest {
  projectId: number
}

interface UploadArchiveArgs extends CloudRequest {
  projectId: number
  name: string
  path: string
}

export class TestClient {
  #credentials: CloudCredentials

  constructor(credentials: CloudCredentials) {
    this.#credentials = credentials
  }

  async listInProject({
    projectId,
    signal,
  }: ListTestsInProjectArgs): Promise<CloudTest[]> {
    const collected: CloudTest[] = []
    let nextUrl: string | null = url(
      `/projects/${projectId}/load_tests?$top=1000`
    )

    while (nextUrl !== null) {
      const response: Response = await fetch(nextUrl, {
        headers: getHeaders(this.#credentials),
        signal,
      })

      if (!response.ok) {
        throw new Error('Failed to fetch tests.')
      }

      const page: ListCloudTestsPage = await parse(
        response,
        ListCloudTestsPageSchema
      )
      collected.push(...page.value)
      nextUrl = page['@nextLink'] ?? null
    }

    return collected
  }

  async findByName({ projectId, name, signal }: GetByTestNameArgs) {
    const response = await fetch(url(`/projects/${projectId}/load_tests`), {
      headers: getHeaders(this.#credentials),
      signal,
    })

    if (!response.ok) {
      throw new Error('Failed to fetch tests.')
    }

    const tests = await parse(response, ListCloudTestsSchema)

    return tests.value.find((test) => test.name === name) ?? null
  }

  async upload({ projectId, name, path, signal }: UploadArchiveArgs) {
    const archiveData = await readFile(path)

    const test = await this.findByName({
      projectId,
      name,
      signal,
    })

    if (test === null) {
      const body = new FormData()

      body.append('name', name)
      body.append('script', new Blob([archiveData]), 'script.tar')

      const response = await fetch(url(`/projects/${projectId}/load_tests`), {
        method: 'POST',
        headers: getHeaders(this.#credentials),
        body,
        signal,
      })

      if (!response.ok) {
        throw new Error('Failed to create a new test with the script archive.')
      }

      return parse(response, CloudTestSchema)
    }

    const response = await fetch(url(`/load_tests/${test.id}/script`), {
      method: 'PUT',
      headers: {
        ...getHeaders(this.#credentials),
        'Content-Type': 'application/octet-stream',
      },
      body: archiveData,
      signal,
    })

    if (!response.ok) {
      throw new Error(`Failed to upload archive for test with id ${test.id}.`)
    }

    return test
  }

  async run({ testId, signal }: RunTestArgs): Promise<StartCloudTestRun> {
    const response = await fetch(url(`/load_tests/${testId}/start`), {
      method: 'POST',
      headers: getHeaders(this.#credentials),
      signal,
    })

    if (!response.ok) {
      throw new Error('Failed to run the test.')
    }

    return parse(response, StartCloudTestRunSchema)
  }

  async getScriptSource({ testId, signal }: RunTestArgs): Promise<string> {
    const response = await fetch(url(`/load_tests/${testId}/script`), {
      headers: {
        ...getHeaders(this.#credentials),
        Accept: 'text/javascript',
      },
      signal,
    })

    if (!response.ok) {
      throw new Error('Failed to download the test script.')
    }

    return response.text()
  }

  async putScriptSource({
    testId,
    source,
    signal,
  }: RunTestArgs & { source: string }): Promise<void> {
    const response = await fetch(url(`/load_tests/${testId}/script`), {
      method: 'PUT',
      headers: {
        ...getHeaders(this.#credentials),
        'Content-Type': 'application/octet-stream',
      },
      body: new TextEncoder().encode(source),
      signal,
    })

    if (!response.ok) {
      throw new Error('Failed to upload the test script.')
    }
  }
}
