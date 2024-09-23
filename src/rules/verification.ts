import { RequestSnippetSchema } from '@/types'

export function applyVerificationRule(
  requestSnippetSchema: RequestSnippetSchema
): RequestSnippetSchema {
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
}
