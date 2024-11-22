import { RequestSnippetSchema } from '@/types'
import { CustomCodeRule, CustomCodeRuleInstance } from '@/types/rules'
import { matchFilter } from './utils'

export function createCustomCodeRuleInstance(
  rule: CustomCodeRule
): CustomCodeRuleInstance {
  return {
    rule,
    type: rule.type,
    apply: (requestSnippetSchema: RequestSnippetSchema) => {
      if (!matchFilter(requestSnippetSchema.data.request, rule.filter)) {
        return requestSnippetSchema
      }

      const block = rule.placement === 'before' ? 'before' : 'after'

      return {
        ...requestSnippetSchema,
        [block]: [...requestSnippetSchema[block], rule.snippet],
      }
    },
  }
}
