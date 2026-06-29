import { tool, ToolSet } from 'ai'
import { z } from 'zod'

import {
  ThresholdConditionSchema,
  ThresholdMetricSchema,
  ThresholdStatisticSchema,
} from '@/schemas/generator'
import { recordingSearchTools } from '@/utils/assistant/tools'

import { buildSystemPrompt } from '../systemPrompt'

export const thresholdSuggestionSchema = z.object({
  metric: ThresholdMetricSchema,
  statistic: ThresholdStatisticSchema,
  condition: ThresholdConditionSchema,
  value: z.number().min(0),
  stopTest: z
    .boolean()
    .describe('True when crossing the threshold should abort the test'),
  rationale: z
    .string()
    .describe('One short sentence shown to the user, citing observed data'),
})

export const suggestThresholdsInputSchema = z.object({
  thresholds: z.array(thresholdSuggestionSchema),
})

export const thresholdsTools = {
  ...recordingSearchTools,

  suggestThresholds: tool({
    description:
      'Submit the recommended set of thresholds for this test. Call this exactly once.',
    inputSchema: suggestThresholdsInputSchema,
  }),

  finish: tool({
    description: 'Call this tool once threshold analysis is finished.',
    inputSchema: z.object({
      outcome: z
        .enum(['success', 'failure'])
        .describe(
          'Use success when thresholds were recommended. Use failure when analysis was not possible.'
        ),
    }),
  }),
} satisfies ToolSet

export const systemPrompt = buildSystemPrompt({
  task: 'Your task is to recommend pass/fail thresholds tuned to the latency observed in the recording.',
  backtickTargets: 'metrics and paths',
  body: `## Guidelines

- Base \`http_req_duration\` thresholds on the observed percentiles with sensible headroom (e.g. p(95) below roughly 1.3x the observed p95, rounded to a friendly number).
- Always include a failed-request budget: \`http_req_failed\` rate below a small fraction (0.01 means 1%). Set stopTest true for it when the observed failure rate is 0.
- Use 2-4 thresholds total. Prefer http_req_duration with p(95) and p(99), plus http_req_failed.
- Duration values are in milliseconds. Rate values are fractions between 0 and 1.
- If the recording has no timing data, recommend conservative industry defaults (p(95) < 1000 ms, p(99) < 2000 ms) and say so in the rationale.

## Process

1. Review the response-time statistics provided (use search tools only if you need more context about specific endpoints).
2. Call suggestThresholds exactly once with the full set.
3. Call finish with the outcome.`,
})
