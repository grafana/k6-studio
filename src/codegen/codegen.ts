import { K6_EXPORTS, REQUIRED_IMPORTS } from '@/constants/imports'
import { getCustomCodeSnippet } from '@/rules/parameterization'
import { applyRules } from '@/rules/rules'
import { ProxyData, RequestSnippetSchema } from '@/types'
import { GeneratorFileData } from '@/types/generator'
import { CustomCodeValue, ParameterizationRule, TestRule } from '@/types/rules'
import { DataFile, Variable } from '@/types/testData'
import { ThinkTime } from '@/types/testOptions'
import { getFileNameWithoutExtension } from '@/utils/file'
import { groupProxyData } from '@/utils/groups'
import { getContentTypeWithCharsetHeader } from '@/utils/headers'
import { exhaustive } from '@/utils/typescript'

import {
  cleanupRecording,
  generateScriptHeader,
  shouldIncludeHeaderInScript,
} from './codegen.utils'
import { generateImportStatement } from './imports'
import { generateOptions } from './options'

interface GenerateScriptParams {
  recording: ProxyData[]
  generator: GeneratorFileData
}

export function generateScript({
  recording,
  generator,
}: GenerateScriptParams): string {
  return `
    // ${generateScriptHeader()}
    
    ${generateImports(generator)}

    export const options = ${generateOptions(generator.options)}

    ${generateVariableDeclarations(generator.testData.variables)}
    ${generateDataFileDeclarations(generator.testData.files)}
    ${generateGetUniqueItemFunction(generator.testData.files)}

    export default function() {
      ${generateVUCode(recording, generator.rules, generator.options.thinkTime)}
    }
  `
}

export function generateImports(generator: GeneratorFileData): string {
  const hasCSVDataFiles = generator.testData.files.some(({ name }) =>
    name.toLowerCase().endsWith('csv')
  )
  const hasJSONDataFiles = generator.testData.files.some(({ name }) =>
    name.toLowerCase().endsWith('json')
  )
  const imports = [
    ...REQUIRED_IMPORTS,
    // Import SharedArray for JSON files
    ...(hasJSONDataFiles ? [K6_EXPORTS['k6/data']] : []),
    // Import k6/experimental/csv for CSV files
    ...(hasCSVDataFiles
      ? [K6_EXPORTS['k6/experimental/csv'], K6_EXPORTS['k6/experimental/fs']]
      : []),
  ]

  return imports.map(generateImportStatement).join('\n')
}

export function generateVariableDeclarations(variables: Variable[]): string {
  if (variables.length === 0) {
    return ''
  }

  const variableKeyValuePairs = variables
    .filter(({ name }) => name)
    .map(({ name, value }) => `"${name}": ${JSON.stringify(value)}`)
    .join(',\n')

  return `const VARS = {\n${variableKeyValuePairs}\n};`
}

export function generateDataFileDeclarations(files: DataFile[]): string {
  if (files.length === 0) {
    return ''
  }

  const fileKeyValuePairs = files
    .map(({ name }) => {
      const displayName = getFileNameWithoutExtension(name)
      const isCSV = name.toLowerCase().endsWith('csv')

      if (isCSV) {
        return `
        "${displayName}": await csv.parse(await fs.open('../Data/${name}'), { asObjects: true })`
      }

      return `
        "${displayName}": new SharedArray("${displayName}", () => {
          const data = JSON.parse(open('../Data/${name}'));
          return Array.isArray(data) ? data : [data];
        })`
    })
    .join(',\n')

  return `const FILES = {\n${fileKeyValuePairs}\n};`
}

export function generateGetUniqueItemFunction(files: DataFile[]) {
  if (files.length === 0) {
    return ''
  }

  return `
    function getUniqueItem(array){
      return array[execution.scenario.iterationInTest % array.length]
    }`
}

export function generateVUCode(
  recording: ProxyData[],
  rules: TestRule[],
  thinkTime: ThinkTime
): string {
  const cleanedRecording = cleanupRecording(recording)
  const enabledRules = rules.filter((rule) => rule.enabled)

  const requestSnippets = generateRequestSnippets(
    cleanedRecording,
    enabledRules,
    thinkTime
  )

  const parameterizationRules = enabledRules.filter(
    (rule) => rule.type === 'parameterization'
  )
  const parameterizationCustomCode = generateParameterizationCustomCode(
    parameterizationRules
  )

  // Group requests after applying rules to correlate requests between different groups
  const groups = Object.entries(groupProxyData(requestSnippets))

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
    parameterizationCustomCode,
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
    checks,
  } = requestSnippetSchema

  const method = `'${request.method}'`
  // use backticks to allow insert correlation variables later
  const url = `\`${request.url}\``
  let content = 'null'

  try {
    if (request.content) {
      const escapedContent = escapeBackticks(request.content)
      content = `\`${escapedContent}\``

      // if we have postData parameters we need to pass an object to the k6 post function because if it receives
      // a stringified json it won't correctly post the data.
      const contentTypeHeader =
        getContentTypeWithCharsetHeader(request.headers) ?? ''
      if (contentTypeHeader.includes('application/x-www-form-urlencoded')) {
        content = `JSON.parse(\`${escapedContent}\`)`
      }

      if (contentTypeHeader.includes('multipart/form-data')) {
        content = `\`${escapedContent.replace(/(?:\r\n|\r|\n)/g, '\\r\\n')}\``
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

  return [params, ...before, main, generateChecks(checks), ...after].join('\n')
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
  const headers = request.headers
    .filter(([name]) => shouldIncludeHeaderInScript(name))
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

export function generateParameterizationCustomCode(
  rules: ParameterizationRule[]
): string {
  return rules
    .map((rule, index) => ({ rule, parameterizationIndex: index }))
    .filter(({ rule }) => rule.value?.type === 'customCode')
    .map(({ rule, parameterizationIndex }) =>
      getCustomCodeSnippet(
        (rule.value as CustomCodeValue).code,
        parameterizationIndex
      )
    )
    .join('\n')
}

function escapeBackticks(content: string): string {
  return content.replace(/`/g, '\\`')
}

function generateChecks(checks: RequestSnippetSchema['checks']) {
  if (checks.length === 0) {
    return ''
  }

  const checksString = checks
    .map(({ description, expression }) => `'${description}': ${expression}`)
    .join(',')

  return `check(resp, { ${checksString} })`
}
