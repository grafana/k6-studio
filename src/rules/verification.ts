import { RequestSnippetSchema } from '@/types'
import { VerificationRule, VerificationRuleInstance } from '@/types/rules'

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
      const response = requestSnippetSchema.data.response

      if (!response) {
        return requestSnippetSchema
      }

      state.matchedRequestIds = [
        ...state.matchedRequestIds,
        requestSnippetSchema.data.id,
      ]

      const verificationSnippet = `
check(resp, {
    'status matches ${response.statusCode}': (r) => r.status === ${response.statusCode},
  })
`
      return {
        ...requestSnippetSchema,
        after: [...requestSnippetSchema['after'], verificationSnippet],
      }
    },
  }
}
