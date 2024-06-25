import { RequestSnippetSchema } from '@/types'
import { CustomCodeRule, TestRule } from '@/types/rules'
import { exhaustive } from '../utils/typescript'

export function applyRule(
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
