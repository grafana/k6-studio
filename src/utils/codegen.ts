import { GroupedProxyData, ProxyData } from '@/types'
import { CustomCodeRule, TestRule } from '@/types/rules'
import { exhaustive } from './typescript'

interface RequestSnippetSchema {
  data: ProxyData
  before: string[]
  after: string[]
}

export function generateScript(recording: GroupedProxyData, rules: TestRule[]) {
  const before = `
    import { group, sleep } from 'k6'
    import http from 'k6/http'
    
    const options = {};
    export default function() {
  `

  const groups = Object.entries(recording)

  const main = groups
    .map(([groupName, recording]) => {
      const requestSnippets = recording.reduce((acc, data) => {
        const requestSnippetSchema = rules.reduce<RequestSnippetSchema>(
          (acc, rule) => {
            return applyRule(acc, rule)
          },
          {
            data,
            before: [],
            after: [],
          }
        )

        return [acc, generateRequestSnippet(requestSnippetSchema)].join('\n')
      }, '')

      return `
        group('${groupName}', function() {${requestSnippets}});`
    })
    .join(`\n`)

  const after = 'sleep(1) }'

  return [before, main, after].join('\n')
}

function generateRequestSnippet(requestSnippetSchema: RequestSnippetSchema) {
  const {
    before,
    after,
    data: { request },
  } = requestSnippetSchema

  const main = `
    http.request('${request.method}', '${request.url}', '${JSON.stringify(request.content)}', {});
  `

  return [...before, main, ...after].join('\n')
}

function applyRule(
  requestSnippetSchema: RequestSnippetSchema,
  rule: TestRule
): RequestSnippetSchema {
  switch (rule.type) {
    case 'customCode':
      return applyCustomCodeRule(requestSnippetSchema, rule)
    case 'correlation':
    case 'parameterization':
    case 'verification':
      return requestSnippetSchema
    default:
      return exhaustive(rule)
  }
}

function applyCustomCodeRule(
  requestSnippetSchema: RequestSnippetSchema,
  rule: CustomCodeRule
): RequestSnippetSchema {
  const block = rule.placement === 'before' ? 'before' : 'after'

  return {
    ...requestSnippetSchema,
    [block]: [...requestSnippetSchema[block], rule.snippet],
  }
}
