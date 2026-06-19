import { tool, ToolSet } from 'ai'
import { z } from 'zod'

import { ReplacerSelectorSchema } from '@/schemas/generator'
import { recordingSearchTools } from '@/utils/assistant/tools'

export const parameterSchema = z.object({
  field: z
    .string()
    .describe('Short human-readable name of the value, e.g. "email"'),
  location: z.object({
    method: z.string(),
    path: z.string(),
    in: z.enum(['body', 'query', 'headers', 'url']),
  }),
  secret: z
    .boolean()
    .describe(
      'True for passwords, API keys, and tokens - the value is masked in the UI'
    ),
  recordedValue: z
    .string()
    .describe('The value as it appears in the recording'),
  selector: ReplacerSelectorSchema.describe(
    'How to locate the value inside the matched requests. A json selector path is a plain object path like "user.email" - never JSONPath, no "$." prefix.'
  ),
  variableName: z
    .string()
    .regex(/^[a-zA-Z0-9_]+$/)
    .describe(
      'Name for the variable holding this value, e.g. "username" or "max_calories". Letters, digits and underscores only.'
    ),
})

export const addParameterInputSchema = z.object({ parameter: parameterSchema })

export const parameterizationTools = {
  ...recordingSearchTools,

  addParameter: tool({
    description:
      'Extract one hard-coded value from the recording into a test-data variable and create the rule that uses it.',
    inputSchema: addParameterInputSchema,
  }),

  finish: tool({
    description: 'Call this tool once parameterization analysis is finished.',
    inputSchema: z.object({
      outcome: z
        .enum(['success', 'partial-success', 'failure'])
        .describe(
          'Use success when all clear candidates were parameterized. Use partial-success when some proposals need review. Use failure when analysis was not possible.'
        ),
    }),
  }),
} satisfies ToolSet

export const systemPrompt = `
You are an expert at preparing k6 load tests from recorded user sessions.
Your task is to find hard-coded values in the recording and extract them into test-data variables, so the user can change them in one place without editing the script.

IMPORTANT: Your reasoning is displayed to the user in a compact log. Maximum 1-2 short sentences per thought. NEVER use lists, bullet points, or numbered items. USE inline markdown formatting: **bold** for key terms and \`backticks\` for paths, fields, and values. When you identify a key pattern, highlight it using a blockquote (prefix with "> ").

## What to look for

- Credentials in login requests (usernames, emails, passwords)
- API keys and hard-coded tokens that are not session-derived
- Tunable inputs like date ranges, page sizes, and search terms

Do NOT parameterize values that are correlated session state (tokens or IDs extracted from earlier responses) - those are handled by correlation rules. Focus on a small number of high-signal values rather than parameterizing everything.

## addParameter input constraints

- variableName must contain only letters, digits, and underscores (e.g. "username", "max_calories").
- A "json" selector always has from: "body". For values in the URL or query string use a "regex" or "begin-end" selector with from: "url"; for header values use from: "headers".
- A "json" selector path is a plain object path like "user.email" or "items[0].id". NEVER use JSONPath syntax - no "$." prefix.

## Process

1. Use getRequestsMetadata and searchRequests to find candidate requests, then getRequestDetails to inspect them.
2. Call addParameter once per value. Use a selector that matches only the intended value. Each call creates a variable initialized with the recorded value and a rule that references it.
3. Mark credentials and keys as secret.
4. Call finish with the outcome.
`
