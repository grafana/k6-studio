import { RequestSnippetSchema } from '@/types'
import { VerificationRule, VerificationRuleInstance } from '@/types/rules'

import { matchFilter } from './utils'
import {
  getCheckDescription,
  getCheckExpression,
  getValueFromRule,
} from './verification.utils'

export function createVerificationRuleInstance(
  rule: VerificationRule
): VerificationRuleInstance {
  const state: VerificationRuleInstance['state'] = {
    matchedRequestIds: [],
  }

  return {
    rule,
    type: rule.type,
    state,
    apply: (requestSnippetSchema: RequestSnippetSchema) => {
      if (!matchFilter(requestSnippetSchema.data.request, rule.filter)) {
        return requestSnippetSchema
      }

      const {
        data: { response, id },
      } = requestSnippetSchema

      if (!response) {
        return requestSnippetSchema
      }

      state.matchedRequestIds = [...state.matchedRequestIds, id]

      const value = getValueFromRule(rule, response)
      const checkDescription = getCheckDescription(rule, value)
      const checkExpression = getCheckExpression(rule, value)

      const checks = [
        ...requestSnippetSchema.checks,
        {
          description: checkDescription,
          expression: `(r) => ${checkExpression}`,
        },
      ]

      return {
        ...requestSnippetSchema,
        checks,
      }
    },
  }
}
