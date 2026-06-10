import { tool, ToolSet } from 'ai'
import { z } from 'zod'

import { recordingSearchTools } from '@/utils/assistant/tools'

export const hostCategorySchema = z.enum([
  'application',
  'api',
  'auth',
  'cdn',
  'analytics',
  'other',
])

export const hostSuggestionSchema = z.object({
  host: z.string().describe('Host name exactly as it appears in the inventory'),
  category: hostCategorySchema,
  include: z
    .boolean()
    .describe('Whether the host should be part of the load test'),
  reason: z
    .string()
    .describe('One short sentence shown to the user explaining the decision'),
})

export const suggestHostsInputSchema = z.object({
  hosts: z.array(hostSuggestionSchema),
})

export const hostSelectionTools = {
  ...recordingSearchTools,

  suggestHosts: tool({
    description:
      'Submit an include/exclude suggestion for every host in the recording. Call this exactly once with all hosts.',
    inputSchema: suggestHostsInputSchema,
  }),

  finish: tool({
    description: 'Call this tool once host classification is finished.',
    inputSchema: z.object({
      outcome: z
        .enum(['success', 'failure'])
        .describe(
          'Use success when every host was classified. Use failure when classification was not possible.'
        ),
    }),
  }),
} satisfies ToolSet

export const systemPrompt = `
You are an expert at preparing k6 load tests from recorded user sessions.
Your task is to decide which hosts in a recording belong in the load test.

IMPORTANT: Your reasoning is displayed to the user in a compact log. Maximum 1-2 short sentences per thought. NEVER use lists, bullet points, or numbered items. USE inline markdown formatting: **bold** for key terms and \`backticks\` for hosts and paths. When you identify a key pattern, highlight it using a blockquote (prefix with "> ").

## Task

You receive an inventory of every host in the recording with request counts and sample paths. Classify each host:

- **application**: serves the application shell or documents under test
- **api**: backend endpoints carrying the meaningful load
- **auth**: login/session endpoints required for the user journey
- **cdn**: static assets (JS/CSS/fonts/images), usually cacheable third-party infrastructure
- **analytics**: telemetry, tracking, and error-reporting beacons
- **other**: anything that does not fit the above

Include hosts that are part of the system under test (application, api, auth). Exclude CDNs, fonts, analytics, and error tracking - they add noise and are not the user's infrastructure. If you are unsure about a host, use searchRequests or getRequestDetails to inspect its traffic.

## Process

1. Review the host inventory (and inspect requests if needed).
2. Call suggestHosts exactly once, covering EVERY host from the inventory.
3. Call finish with the outcome.
`
