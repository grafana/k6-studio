import { tool, ToolSet } from 'ai'
import { z } from 'zod'

import { buildSystemPrompt } from '../systemPrompt'

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
  suggestHosts: tool({
    description:
      'Submit an include/exclude suggestion for every host in the recording. Call this exactly once with all hosts; it ends the step.',
    inputSchema: suggestHostsInputSchema,
  }),
} satisfies ToolSet

export const systemPrompt = buildSystemPrompt({
  task: 'Your task is to decide which hosts in a recording belong in the load test.',
  backtickTargets: 'hosts and paths',
  body: `## Task

You receive an inventory of every host in the recording with request counts, static-asset counts, response content types, and sample paths. This inventory is all you need - classify each host:

- **application**: serves the application shell or documents under test
- **api**: backend endpoints carrying the meaningful load
- **auth**: login/session endpoints required for the user journey
- **cdn**: static assets (JS/CSS/fonts/images), usually cacheable third-party infrastructure
- **analytics**: telemetry, tracking, and error-reporting beacons
- **other**: anything that does not fit the above

Include hosts that are part of the system under test (application, api, auth). Exclude CDNs, fonts, analytics, and error tracking - they add noise and are not the user's infrastructure. Base each decision on the request counts, content types, and sample paths in the inventory.

## Process

Make a single call to suggestHosts covering EVERY host from the inventory. That one call ends the step - do not call any other tools.`,
})
