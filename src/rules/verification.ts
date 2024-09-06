import { RequestSnippetSchema } from '@/types'

export function applyRecordingVerificationRule(
  requestSnippetSchema: RequestSnippetSchema
): RequestSnippetSchema {
  const response = requestSnippetSchema.data.response

  if (!response) {
    return requestSnippetSchema
  }

  const verificationSnippet = `
check(resp, {
    'Recording Verification Rule: status matches recording': (r) => r.status === ${response.statusCode},
  })
`
  return {
    ...requestSnippetSchema,
    after: [...requestSnippetSchema['after'], verificationSnippet],
  }
}
