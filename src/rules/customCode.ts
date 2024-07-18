import { RequestSnippetSchema } from '@/types'
import { CustomCodeRule } from '@/types/rules'
import { matchFilter } from './utils'

export function applyCustomCodeRule(
  requestSnippetSchema: RequestSnippetSchema,
  rule: CustomCodeRule
): RequestSnippetSchema {
  if (!matchFilter(requestSnippetSchema, rule)) {
    return requestSnippetSchema
  }

  const block = rule.placement === 'before' ? 'before' : 'after'

  return {
    ...requestSnippetSchema,
    [block]: [...requestSnippetSchema[block], rule.snippet],
  }
}
