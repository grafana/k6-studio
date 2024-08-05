import {
  GroupedProxyData,
  ProxyData,
  RequestSnippetSchema,
  Request,
  Header,
} from '@/types'
import { CorrelationStateMap, TestRule } from '@/types/rules'
import { applyRule } from '@/rules/rules'
import { generateSequentialInt } from '@/rules/utils'
import { GeneratorFileData } from '@/types/generator'
import { Variable } from '@/types/testData'
import { ThinkTime } from '@/types/testOptions'
import { exhaustive } from '@/utils/typescript'
import { generateOptions } from './options'

interface GenerateScriptParams {
  recording: GroupedProxyData
  generator: GeneratorFileData
}

export function generateScript({
  recording,
  generator,
}: GenerateScriptParams): string {
  return `
    import { group, sleep } from 'k6'
    import http from 'k6/http'

    export const options = ${generateOptions(generator.options)}

    ${generateVariableDeclarations(generator.testData.variables)}

    export default function() {
      ${generateVUCode(recording, generator.rules, generator.options.thinkTime)}
    }
  `
}

export function generateVariableDeclarations(variables: Variable[]): string {
  return variables
    .filter(({ name }) => name)
    .map(({ name, value }) => `const ${name} = "${value}"`)
    .join('\n')
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
    }
  } catch (error) {
    console.error('Failed to serialize request content', error)
  }

  const params = `params = ${generateRequestParams(request)}`

  const main = `
    resp = http.request(${method}, ${url}, ${content}, params)
  `

  return [params, ...before, main, ...after].join('\n')
}

function generateSleep(timing: ThinkTime['timing']): string {
  switch (timing.type) {
    case 'fixed':
      return `sleep(${timing.value})`
    case 'range':
      return `sleep(Math.random() * (${timing.value.max} - ${timing.value.min}) + ${timing.value.min})`
    default:
      return exhaustive(timing)
  }
}

function generateRequestParams(request: ProxyData['request']): string {
  const headers = request.headers
    .filter(([name]) => name !== 'Cookie')
    .map(([name, value]) => `'${name}': \`${value}\``)
    .join(',')
  return `
    {
      headers: {
        ${headers}
      },
      cookies: {
        ${request.cookies.map(([name, value]) => `'${name}': {value: \`${value}\`, replace: true}`).join(',\n')}
      }
    }
  `
}

// @ts-expect-error we have commonjs set as module option
if (import.meta.vitest) {
  // @ts-expect-error we have commonjs set as module option
  const { it, expect } = import.meta.vitest

  const generateRequest = (headers: Header[]): Request => {
    return {
      method: 'POST',
      url: 'http://test.k6.io/api/v1/foo',
      headers,
      cookies: [['security', 'none']],
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
        'security': {value: \`none\`, replace: true}
      }
    }
  `
    expect(generateRequestParams(request)).toBe(expectedResult)
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
        'security': {value: \`none\`, replace: true}
      }
    }
  `
    expect(generateRequestParams(request)).toBe(expectedResult)
  })
}
