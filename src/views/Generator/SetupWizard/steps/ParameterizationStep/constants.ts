import { tool, ToolSet } from 'ai'
import { z } from 'zod'

import {
  CustomCodeValueSchema,
  ReplacerSelectorSchema,
  StringValueSchema,
} from '@/schemas/generator'
import { recordingSearchTools } from '@/utils/assistant/tools'

// `variable` and `dataFileValue` are deliberately excluded from AI proposals:
// a fresh generator has no variables or data files yet, so proposing them
// would produce broken scripts. The user can still pick them in the editor.
export const proposedValueSchema = z.discriminatedUnion('type', [
  StringValueSchema,
  CustomCodeValueSchema,
])

export const parameterSchema = z.object({
  field: z
    .string()
    .describe('Short human-readable name of the value, e.g. "email"'),
  location: z.object({
    method: z.string(),
    path: z.string(),
    in: z.enum(['body', 'query', 'headers', 'url']),
  }),
  confidence: z
    .enum(['high', 'low'])
    .describe(
      'high when the value clearly should vary per virtual user, low when the user should double-check'
    ),
  secret: z
    .boolean()
    .describe(
      'True for passwords, API keys, and tokens - the value is masked in the UI'
    ),
  recordedValue: z
    .string()
    .describe('The value as it appears in the recording'),
  selector: ReplacerSelectorSchema.describe(
    'How to locate the value inside the matched requests'
  ),
  value: proposedValueSchema.describe('The proposed replacement value'),
})

export const addParameterInputSchema = z.object({ parameter: parameterSchema })

export const parameterizationTools = {
  ...recordingSearchTools,

  addParameter: tool({
    description:
      'Create a parameterization rule for one hard-coded value found in the recording.',
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
Your task is to find hard-coded values in the recording that should vary per virtual user or be tunable, and propose parameterization rules for them.

IMPORTANT: Your reasoning is displayed to the user in a compact log. Maximum 1-2 short sentences per thought. NEVER use lists, bullet points, or numbered items. USE inline markdown formatting: **bold** for key terms and \`backticks\` for paths, fields, and values. When you identify a key pattern, highlight it using a blockquote (prefix with "> ").

## What to look for

- Credentials in login requests (usernames, emails, passwords)
- API keys and hard-coded tokens that are not session-derived
- Tunable inputs like date ranges, page sizes, and search terms

Do NOT parameterize values that are correlated session state (tokens or IDs extracted from earlier responses) - those are handled by correlation rules. Focus on a small number of high-signal values rather than parameterizing everything.

## addParameter input constraints

- value.type must be "string" (with a "value" field) or "customCode" (with a "code" field). Variables and data files are NOT valid proposals - the user can switch to them later.
- A "json" selector always has from: "body". For values in the URL or query string use a "regex" or "begin-end" selector with from: "url"; for header values use from: "headers".

## Process

1. Use getRequestsMetadata and searchRequests to find candidate requests, then getRequestDetails to inspect them.
2. Call addParameter once per value. Use a selector that matches only the intended value. Propose a sensible replacement: a text value for tunables, or custom code when the value must be generated.
3. Mark credentials and keys as secret with high confidence; mark guesses as low confidence.
4. Call finish with the outcome.
`
