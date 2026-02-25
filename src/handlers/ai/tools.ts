import { asSchema, tool, ToolSet } from 'ai'
import { z } from 'zod'

import {
  BeginEndSelectorSchema,
  FilterSchema,
  HeaderNameSelectorSchema,
  JsonSelectorSchema,
  RegexSelectorSchema,
} from '@/types/autoCorrelation'

export interface RemoteToolDefinition {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

const addRuleBaseSchema = z.object({
  extractor: z.object({
    filter: FilterSchema,
    extractionMode: z
      .enum(['single', 'multiple'])
      .default('single')
      .describe(
        'single: use the first extracted value; multiple: use the latest value when extracted from multiple requests'
      ),
  }),
})

const addRuleBeginEndSchema = addRuleBaseSchema.extend({
  extractor: addRuleBaseSchema.shape.extractor.extend({
    selector: BeginEndSelectorSchema,
  }),
})

const addRuleRegexSchema = addRuleBaseSchema.extend({
  extractor: addRuleBaseSchema.shape.extractor.extend({
    selector: RegexSelectorSchema.extend({}),
  }),
})

const addRuleJsonSchema = addRuleBaseSchema.extend({
  extractor: addRuleBaseSchema.shape.extractor.extend({
    selector: JsonSelectorSchema,
  }),
})

const addRuleHeaderNameSchema = addRuleBaseSchema.extend({
  extractor: addRuleBaseSchema.shape.extractor.extend({
    selector: HeaderNameSelectorSchema,
  }),
})

export function getToolDefinitionsForA2A(): RemoteToolDefinition[] {
  return Object.entries(tools).map(([name, t]) => ({
    name,
    description: t.description ?? '',
    inputSchema: asSchema(t.inputSchema).jsonSchema as Record<string, unknown>,
  }))
}

export const tools = {
  runValidation: tool({
    description: 'Start a validation run with the current set of rules',
    inputSchema: z.object({}),
  }),

  searchRequests: tool({
    description:
      'Search for requests in the recording using a query string. Returns metadata only (id, method, url, statusCode) without full request/response bodies. Use this to find specific requests efficiently before fetching full details.',
    inputSchema: z.object({
      query: z
        .string()
        .describe(
          'Search query - can match against URL, method, path, host, status code. Examples: "login", "POST", "/api/users", "401"'
        ),
      limit: z
        .number()
        .optional()
        .default(20)
        .describe('Maximum number of results to return (default: 20)'),
    }),
  }),

  getRequestsMetadata: tool({
    description:
      'Get lightweight metadata for all requests in the recording (id, method, url, statusCode, hasRequestBody, hasResponseBody). Use this to get an overview of the recording without loading full request/response data.',
    inputSchema: z.object({
      startIndex: z.number().optional().default(0),
      endIndex: z
        .number()
        .optional()
        .describe(
          'End index (exclusive). If not provided, returns all requests from startIndex to end.'
        ),
    }),
  }),

  getRequestDetails: tool({
    description:
      'Get full details for specific requests by their IDs. Only returns the requested fields to minimize token usage.',
    inputSchema: z.object({
      requestIds: z
        .array(z.string())
        .describe('Array of request IDs to fetch details for'),
      fields: z
        .array(
          z.enum([
            'headers',
            'body',
            'cookies',
            'responseHeaders',
            'responseBody',
            'responseCookies',
          ])
        )
        .optional()
        .describe(
          'Optional array of fields to include. If not specified, returns all fields.'
        ),
    }),
  }),

  addRuleBeginEnd: tool({
    description: 'Create a correlation rule with a begin-end selector.',
    inputSchema: z.object({ rule: addRuleBeginEndSchema }),
  }),

  addRuleRegex: tool({
    description: 'Create a correlation rule with a regex selector..',
    inputSchema: z.object({ rule: addRuleRegexSchema }),
  }),

  addRuleJson: tool({
    description: 'Create a correlation rule with a JSON-path selector.',
    inputSchema: z.object({ rule: addRuleJsonSchema }),
  }),

  addRuleHeaderName: tool({
    description: 'Create a correlation rule with a header-name selector.',
    inputSchema: z.object({ rule: addRuleHeaderNameSchema }),
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
