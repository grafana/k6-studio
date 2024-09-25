import {
  GroupedProxyData,
  ProxyData,
  RequestSnippetSchema,
  Request,
  Header,
  Cookie,
} from '@/types'
import { CorrelationStateMap, TestRule } from '@/types/rules'
import { applyRule } from '@/rules/rules'
import { generateSequentialInt } from '@/rules/utils'
import { GeneratorFileData } from '@/types/generator'
import { Variable } from '@/types/testData'
import { ThinkTime } from '@/types/testOptions'
import { exhaustive } from '@/utils/typescript'
import { generateOptions } from './options'
import { getContentTypeWithCharsetHeader } from '@/utils/headers'
import { REQUIRED_IMPORTS } from '@/constants/imports'
import { generateImportStatement } from './imports'

interface GenerateScriptParams {
  recording: GroupedProxyData
  generator: GeneratorFileData
}

export function generateScript({
  recording,
  generator,
}: GenerateScriptParams): string {
  return `
    ${generateScriptHeader()}
    ${REQUIRED_IMPORTS.map(generateImportStatement).join('\n')}

    export const options = ${generateOptions(generator.options)}

    ${generateVariableDeclarations(generator.testData.variables)}

    export default function() {
      ${generateVUCode(recording, generator.rules, generator.options.thinkTime)}
    }
  `
}

export function generateVariableDeclarations(variables: Variable[]): string {
  if (variables.length === 0) {
    return ''
  }

  const variables_lines = variables
    .filter(({ name }) => name)
    .map(({ name, value }) => `"${name}": ${JSON.stringify(value)},`)
    .join('\n')

  return `const VARS = {\n${variables_lines}\n}\n`
}

export function generateVUCode(
  recording: GroupedProxyData,
  rules: TestRule[],
  thinkTime: ThinkTime
): string {
  const groups = Object.entries(recording)
  const correlationStateMap: CorrelationStateMap = {}
  const sequentialIdGenerator = generateSequentialInt()

  const groupSnippets = groups
    .map(([groupName, recording]) => {
      const requestSnippets = generateRequestSnippets(
        recording,
        rules,
        correlationStateMap,
        sequentialIdGenerator,
        thinkTime
      )

      return generateGroupSnippet(groupName, requestSnippets, thinkTime)
    })
    .join(`\n`)

  return [
    `
    let params
    let resp
    let match
    let regex
    let url
    const correlation_vars = {}
    `,
    groupSnippets,
    thinkTime.sleepType === 'iterations' ? generateSleep(thinkTime.timing) : '',
  ].join('\n')
}

export function generateRequestSnippets(
  recording: ProxyData[],
  rules: TestRule[],
  correlationStateMap: CorrelationStateMap,
  sequentialIdGenerator: Generator<number>,
  thinkTime: ThinkTime
): string {
  return recording.reduce((acc, data) => {
    const requestSnippetSchema = rules.reduce<RequestSnippetSchema>(
      (acc, rule) =>
        applyRule(acc, rule, correlationStateMap, sequentialIdGenerator),
      { data, before: [], after: [] }
    )

    const requestSnippet = generateSingleRequestSnippet(requestSnippetSchema)

    return `${acc}
      ${requestSnippet}
      ${thinkTime.sleepType === 'requests' ? `${generateSleep(thinkTime.timing)}` : ''}`
  }, '')
}

export function generateGroupSnippet(
  groupName: string,
  requestSnippets: string,
  thinkTime: ThinkTime
): string {
  return `group('${groupName}', function() {
    ${requestSnippets}
  });
  ${thinkTime.sleepType === 'groups' ? `${generateSleep(thinkTime.timing)}` : ''}`
}

export function generateSingleRequestSnippet(
  requestSnippetSchema: RequestSnippetSchema
): string {
  const {
    before,
    after,
    data: { request },
  } = requestSnippetSchema

  const method = `'${request.method}'`
  // use backticks to allow insert correlation variables later
  const url = `\`${request.url}\``
  let content = 'null'

  try {
    if (request.content) {
      content = `\`${request.content}\``

      // if we have postData parameters we need to pass an object to the k6 post function because if it receives
      // a stringified json it won't correctly post the data.
      const contentTypeHeader =
        getContentTypeWithCharsetHeader(request.headers) ?? ''
      if (contentTypeHeader.includes('application/x-www-form-urlencoded')) {
        content = `JSON.parse(\`${request.content}\`)`
      }

      if (contentTypeHeader.includes('multipart/form-data')) {
        content = `\`${request.content.replace(/(?:\r\n|\r|\n)/g, '\\r\\n')}\``
      }
    }
  } catch (error) {
    console.error('Failed to serialize request content', error)
  }

  const params = `params = ${generateRequestParams(request)}`

  const main = `
    url = http.url${url}
    resp = http.request(${method}, url, ${content}, params)
  `

  return [params, ...before, main, ...after].join('\n')
}

function generateSleep(timing: ThinkTime['timing']): string {
  switch (timing.type) {
    case 'fixed':
      return timing.value !== null ? `sleep(${timing.value})` : ''
    case 'range':
      return `sleep(Math.random() * (${timing.value.max} - ${timing.value.min}) + ${timing.value.min})`
    default:
      return exhaustive(timing)
  }
}

function generateRequestParams(request: ProxyData['request']): string {
  const headersToExclude = ['Cookie', 'User-Agent', 'Host', 'Content-Length']
  const headers = request.headers
    .filter(([name]) => !headersToExclude.includes(name))
    .map(([name, value]) => `'${name}': \`${value}\``)
    .join(',')

  const cookies = request.cookies
    .filter(([, value]) => value.includes('${correlation_vars['))
    .map(([name, value]) => `'${name}': {value: \`${value}\`, replace: true}`)
    .join(',\n')

  return `
    {
      headers: {
        ${headers}
      },
      cookies: {
        ${cookies}
      }
    }
  `
}

// @ts-expect-error we have commonjs set as module option
if (import.meta.vitest) {
  // @ts-expect-error we have commonjs set as module option
  const { it, expect } = import.meta.vitest

  const generateRequest = (
    headers: Header[],
    cookies: Cookie[] = [['security', 'none']]
  ): Request => {
    return {
      method: 'POST',
      url: 'http://test.k6.io/api/v1/foo',
      headers,
      cookies: cookies,
      query: [],
      scheme: 'http',
      host: 'localhost:3000',
      content: '',
      path: '/api/v1/foo',
      timestampStart: 0,
      timestampEnd: 0,
      contentLength: 0,
      httpVersion: '1.1',
    }
  }

  it('generate request params', () => {
    const headers: Header[] = [['content-type', 'application/json']]
    const request = generateRequest(headers)

    const expectedResult = `
    {
      headers: {
        'content-type': \`application/json\`
      },
      cookies: {

      }
    }
  `
    expect(generateRequestParams(request).replace(/\s/g, '')).toBe(
      expectedResult.replace(/\s/g, '')
    )
  })

  it('generate request params with cookie header', () => {
    const headers: Header[] = [
      ['content-type', 'application/json'],
      ['Cookie', 'hello=world'],
    ]
    const request = generateRequest(headers)

    const expectedResult = `
    {
      headers: {
        'content-type': \`application/json\`
      },
      cookies: {

      }
    }
  `
    expect(generateRequestParams(request).replace(/\s/g, '')).toBe(
      expectedResult.replace(/\s/g, '')
    )
  })

  it('generate request params with cookies with correlation', () => {
    const headers: Header[] = [
      ['content-type', 'application/json'],
      ['Cookie', "security=${correlation_vars['correlation_0']}"],
    ]
    const cookies: Cookie[] = [
      ['security', "${correlation_vars['correlation_0']}"],
    ]
    const request = generateRequest(headers, cookies)

    const expectedResult = `
    {
      headers: {
        'content-type': \`application/json\`
      },
      cookies: {
        'security': {value: \`\${correlation_vars['correlation_0']}\`, replace: true}
      }
    }
  `
    expect(generateRequestParams(request)).toBe(expectedResult)
  })
}

const generateScriptHeader = () => {
  return `// Generated by k6 Studio (${__APP_VERSION__}) on ${new Date().toISOString()}\n`
}
