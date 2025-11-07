import { tool, ToolSet } from 'ai'
import { z } from 'zod'

import { AiCorrelationRuleSchema } from '@/types/autoCorrelation'

export const tools = {
  runValidation: tool({
    description: 'Start a validation run with the current set of rules',
    inputSchema: z.object({}),
  }),

  getRecording: tool({
    description: 'Get the original recording, query in batches of 10',
    inputSchema: z.object({
      startIndex: z.number(),
      endIndex: z.number(),
    }),
  }),

  addRule: tool({
    description:
      'Create a correlation rule. It will return array of matches request ids. If no requests matched rule will not be added and you need to create another one.',
    inputSchema: z.object({ rule: AiCorrelationRuleSchema }),
  }),

  finish: tool({
    description: 'Call this tool once correlation is finished.',
    inputSchema: z.object({
      outcome: z
        .enum(['success', 'partial-success', 'failure'])
        .describe(
          'Use success when all requests are correlated and validation is passing. Use partial-success when some requests are still failing but significant progress has been made. Use failure when no progress has been made and validation is still failing.'
        ),
      reason: z.string().describe('A short explanation of the outcome.'),
    }),
  }),
} satisfies ToolSet
