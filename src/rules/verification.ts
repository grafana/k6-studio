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
    'is status ${response.statusCode}': (r) => r.status === ${response.statusCode},
  });
`
  return {
    ...requestSnippetSchema,
    after: [...requestSnippetSchema['after'], verificationSnippet],
  }
}
