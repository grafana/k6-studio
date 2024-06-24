import { GroupedProxyData, RequestSnippetSchema } from '@/types'
import { TestRule } from '@/types/rules'
import { applyRule } from '@/utils/rules'

export function generateScript(recording: GroupedProxyData, rules: TestRule[]) {
  const before = `
    import { group, sleep } from 'k6'
    import http from 'k6/http'
    
    export const options = {}
    
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

      if (groups.length === 1) return requestSnippets

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

  const method = `'${request.method}'`
  const url = `'${request.url}'`
  const content = request.content
    ? `'${JSON.stringify(request.content)}'`
    : 'null'
  const options = '{}'

  const main = `
    http.request(${method}, ${url}, ${content}, ${options});
  `

  return [...before, main, ...after].join('\n')
}
