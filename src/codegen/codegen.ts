import { ProxyData, RequestSnippetSchema } from '@/types'
import { TestRule } from '@/types/rules'
import { applyRules } from '@/rules/rules'
import { GeneratorFileData } from '@/types/generator'
import { Variable } from '@/types/testData'
import { ThinkTime } from '@/types/testOptions'
import { exhaustive } from '@/utils/typescript'
import { generateOptions } from './options'
import { getContentTypeWithCharsetHeader } from '@/utils/headers'
import { REQUIRED_IMPORTS } from '@/constants/imports'
import { generateImportStatement } from './imports'
import { cleanupRecording } from './codegen.utils'
import { groupBy } from 'lodash-es'

interface GenerateScriptParams {
  recording: ProxyData[]
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
  recording: ProxyData[],
  rules: TestRule[],
  thinkTime: ThinkTime
): string {
  const cleanedRecording = cleanupRecording(recording)

  const requestSnippets = generateRequestSnippets(
    cleanedRecording,
    rules,
    thinkTime
  )

  // Group requests after applying rules to correlate requests between different groups
  const groups = Object.entries(groupBy(requestSnippets, (item) => item.group))

  const groupSnippets = groups
    .map(([groupName, requestSnippetSchemas]) => {
      const requestSnippet = requestSnippetSchemas
        .map(({ snippet }) => snippet)
        .join('\n')

      return generateGroupSnippet(groupName, requestSnippet, thinkTime)
    })
    .join('\n')

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

type GenerateRequestSnippetReturnValue = Array<{
  snippet: string
  group?: string
}>

export function generateRequestSnippets(
  recording: ProxyData[],
  rules: TestRule[],
  thinkTime: ThinkTime
): GenerateRequestSnippetReturnValue {
  const { requestSnippetSchemas } = applyRules(recording, rules)
  return requestSnippetSchemas.reduce<GenerateRequestSnippetReturnValue>(
    (acc, requestSnippetSchema) => {
      const requestSnippet = generateSingleRequestSnippet(requestSnippetSchema)

      return [
        ...acc,
        {
          group: requestSnippetSchema.data.group,
          snippet: `
            ${requestSnippet}
            ${thinkTime.sleepType === 'requests' ? `${generateSleep(thinkTime.timing)}` : ''}
          `,
        },
      ]
    },
    []
  )
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

export function generateRequestParams(request: ProxyData['request']): string {
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

const generateScriptHeader = () => {
  return `// Generated by k6 Studio (${__APP_VERSION__}) on ${new Date().toISOString()}\n`
}
