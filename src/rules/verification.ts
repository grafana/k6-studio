import { RequestSnippetSchema } from '@/types'
import { VerificationRule, VerificationRuleInstance } from '@/types/rules'

export function createVerificationRuleInstance(
  rule: VerificationRule
): VerificationRuleInstance {
  return {
    rule,
    type: rule.type,
    apply: (requestSnippetSchema: RequestSnippetSchema) => {
      const response = requestSnippetSchema.data.response

      if (!response) {
        return requestSnippetSchema
      }

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
