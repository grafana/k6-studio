import { HttpError } from '@/utils/errors'

import { ListCloudProjectsSchema } from './schemas'
import { CloudCredentials, CloudRequest } from './types'
import { getHeaders, parse, url } from './utils'

export class ProjectClient {
  #credentials: CloudCredentials

  constructor(credentials: CloudCredentials) {
    this.#credentials = credentials
  }

  async findDefault({ signal }: CloudRequest) {
    const response = await fetch(url(`/projects`), {
      headers: getHeaders(this.#credentials),
      signal,
    })

    if (!response.ok) {
      throw new HttpError('Failed to fetch projects.', response)
    }

    const projects = await parse(response, ListCloudProjectsSchema)

    const project = projects.value.find((project) => project.is_default)

    if (project === undefined) {
      throw new Error('Could not find a default project.')
    }

    return project
  }
}
