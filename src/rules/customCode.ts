import { RequestSnippetSchema } from '@/types'
import { CustomCodeRule, CustomCodeRuleInstance } from '@/types/rules'

import { matchFilter } from './utils'

export function createCustomCodeRuleInstance(
  rule: CustomCodeRule
): CustomCodeRuleInstance {
  const state: CustomCodeRuleInstance['state'] = {
    matchedRequestIds: [],
  }

  return {
    rule,
    state,
    type: rule.type,
    apply: (requestSnippetSchema: RequestSnippetSchema) => {
      if (!matchFilter(requestSnippetSchema.data.request, rule.filter)) {
        return requestSnippetSchema
      }

      state.matchedRequestIds = [
        ...state.matchedRequestIds,
        requestSnippetSchema.data.id,
      ]

      const block = rule.placement === 'before' ? 'before' : 'after'

      return {
        ...requestSnippetSchema,
        [block]: [...requestSnippetSchema[block], rule.snippet],
      }
    },
  }
}
