import { GroupedProxyData, ProxyData, RequestSnippetSchema } from '@/types'
import { CorrelationStateMap, TestRule } from '@/types/rules'
import { applyRule } from '@/rules/rules'
import { generateSequentialInt } from '@/rules/utils'
import { GeneratorFileData } from '@/types/generator'
import { Variable } from '@/types/testData'
import { TestOptions, ThinkTime } from '@/types/testOptions'
import { exhaustive } from '@/utils/typescript'

interface GenerateScriptParams {
  recording: GroupedProxyData
  generator: GeneratorFileData
}

/**
 * Generates a k6 script from the recording and rules
 * @param params - The parameters object
 * @param params.recording - The group recording
 * @param params.generator - The generator object
 * @returns {string}
 */
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

/**
 * Generates the options object for the k6 script
 * @returns {string}
 */
export function generateOptions(options: TestOptions): string {
  console.log(options)
  return '{}'
}

/**
 * Generates declarations for test variables
 * @param variables - The variables to include in the script
 * @returns {string}
 */
export function generateVariableDeclarations(variables: Variable[]): string {
  return variables
    .filter(({ name }) => name)
    .map(({ name, value }) => `const ${name} = "${value}"`)
    .join('\n')
}

/**
 * Generates the VU code for the k6 script
 * @param recording - The recording
 * @param rules - The set of rules to apply to the recording
 * @returns {string}
 */
export function generateVUCode(
  recording: GroupedProxyData,
  rules: TestRule[],
  thinkTime: ThinkTime
): string {
  const groups = Object.entries(recording)
  const isSingleGroup = groups.length === 1
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

      return isSingleGroup
        ? requestSnippets
        : generateGroupSnippet(groupName, requestSnippets, thinkTime)
    })
    .join(`\n`)

  return [
    `
    let resp
    let match
    let regex
    `,
    groupSnippets,
    thinkTime.sleepType === 'iterations' ? generateSleep(thinkTime.timing) : '',
  ].join('\n')
}

/**
 * Generates request snippets for a single group
 * @param recording - The recording of a single group
 * @param rules - The set of rules to apply to the recording
 * @returns {string}
 */
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

/**
 *
 * @param groupName - The name of the group
 * @param requestSnippets - The request snippets
 * @returns {string}
 */
export function generateGroupSnippet(
  groupName: string,
  requestSnippets: string,
  thinkTime: ThinkTime
): string {
  return `group('${groupName}', function() {
    ${requestSnippets}
    ${thinkTime.sleepType === 'groups' ? `${generateSleep(thinkTime.timing)}` : ''}
  });`
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

  const params = '{}'

  const main = `
    resp = http.request(${method}, ${url}, ${content}, ${params})
  `

  return [...before, main, ...after].join('\n')
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
