import { GroupedProxyData, ProxyData, RequestSnippetSchema } from '@/types'
import { TestRule } from '@/types/rules'
import { applyRule } from '@/utils/rules'

/**
 * Generates a k6 script from the recording and rules
 * @param {GroupedProxyData} recording - The recording
 * @param {TestRule[]} rules - The set of rules to apply to the recording
 * @returns {string}
 */
export function generateScript(
  recording: GroupedProxyData,
  rules: TestRule[]
): string {
  return `
    import { group, sleep } from 'k6'
    import http from 'k6/http'
    
    export const options = ${generateOptions()}
    
    export default function() {
      ${generateVUCode(recording, rules)}
    }
  `
}

/**
 * Generates the options object for the k6 script
 * @returns {string}
 */
export function generateOptions(): string {
  return '{}'
}

/**
 * Generates the VU code for the k6 script
 * @param recording - The recording
 * @param rules - The set of rules to apply to the recording
 * @returns {string}
 */
export function generateVUCode(
  recording: GroupedProxyData,
  rules: TestRule[]
): string {
  const groups = Object.entries(recording)
  const isSingleGroup = groups.length === 1

  const groupSnippets = groups
    .map(([groupName, recording]) => {
      const requestSnippets = generateRequestSnippets(recording, rules)
      return isSingleGroup
        ? requestSnippets
        : generateGroupSnippet(groupName, requestSnippets)
    })
    .join(`\n`)

  return [groupSnippets, 'sleep(1)'].join('\n')
}

/**
 * Generates request snippets for a single group
 * @param recording - The recording of a single group
 * @param rules - The set of rules to apply to the recording
 * @returns {string}
 */
export function generateRequestSnippets(
  recording: ProxyData[],
  rules: TestRule[]
): string {
  return recording.reduce((acc, data) => {
    const requestSnippetSchema = rules.reduce<RequestSnippetSchema>(
      (acc, rule) => applyRule(acc, rule),
      { data, before: [], after: [] }
    )

    const requestSnippet = generateSingleRequestSnippet(requestSnippetSchema)

    return `${acc}\n${requestSnippet}`
  }, '')
}

/**
 *
 * @param groupName - The name of the group
 * @param requestSnippets - The request snippets
 * @returns {string}
 */
export function generateGroupSnippet(
  groupName: string,
  requestSnippets: string
): string {
  return `group('${groupName}', function() {${requestSnippets}});`
}

/**
 * Generates a single HTTP request snippet
 * @param {RequestSnippetSchema} requestSnippetSchema
 * @returns {string}
 */
export function generateSingleRequestSnippet(
  requestSnippetSchema: RequestSnippetSchema
): string {
  const {
    before,
    after,
    data: { request },
  } = requestSnippetSchema

  const method = `'${request.method}'`
  const url = `'${request.url}'`
  let content = 'null'

  try {
    if (request.content) {
      content = `'${JSON.stringify(request.content)}'`
    }
  } catch (error) {
    console.error('Failed to serialize request content', error)
  }

  const params = '{}'

  const main = `
    http.request(${method}, ${url}, ${content}, ${params})
  `

  return [...before, main, ...after].join('\n')
}