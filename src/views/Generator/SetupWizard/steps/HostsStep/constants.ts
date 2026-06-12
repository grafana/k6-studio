import { tool, ToolSet } from 'ai'
import { z } from 'zod'

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

// Single-shot agent: the inventory in the prompt carries everything needed
// for classification, and suggestHosts is the terminal tool, so a run costs
// exactly one model turn.
export const hostSelectionTools = {
  suggestHosts: tool({
    description:
      'Submit an include/exclude suggestion for every host in the recording. Call this exactly once with all hosts; it completes the analysis.',
    inputSchema: suggestHostsInputSchema,
  }),
} satisfies ToolSet

export const systemPrompt = `
You are an expert at preparing k6 load tests from recorded user sessions.
Your task is to decide which hosts in a recording belong in the load test.

You receive an inventory of every host with request counts, static-asset counts, response content types, and sample paths. That is all the information you need: call suggestHosts IMMEDIATELY as your first and only action, covering EVERY host from the inventory. Do not write any analysis text first.

Classify each host:

- **application**: serves the application shell or documents under test
- **api**: backend endpoints carrying the meaningful load
- **auth**: login/session endpoints required for the user journey
- **cdn**: static assets (JS/CSS/fonts/images), usually cacheable third-party infrastructure
- **analytics**: telemetry, tracking, and error-reporting beacons
- **other**: anything that does not fit the above

Include hosts that are part of the system under test (application, api, auth). Exclude CDNs, fonts, analytics, and error tracking - they add noise and are not the user's infrastructure. Keep each reason to one short sentence.
`
