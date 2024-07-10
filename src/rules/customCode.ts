import { RequestSnippetSchema } from '@/types'
import { CustomCodeRule } from '@/types/rules'

export function applyCustomCodeRule(
  requestSnippetSchema: RequestSnippetSchema,
  rule: CustomCodeRule
): RequestSnippetSchema {
  const block = rule.placement === 'before' ? 'before' : 'after'

  return {
    ...requestSnippetSchema,
    [block]: [...requestSnippetSchema[block], rule.snippet],
  }
}
