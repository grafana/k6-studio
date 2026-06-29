import type { FlexibleSchema } from '@ai-sdk/provider-utils'
import { asSchema, tool, ToolSet } from 'ai'
import { z } from 'zod'

import { RemoteToolDefinition } from '@/handlers/ai/types'

/**
 * Converts renderer-side tool definitions (with zod schemas) into the
 * JSON-schema form sent over IPC and forwarded to the assistant.
 */
export function serializeToolDefinitions(
  tools: ToolSet
): RemoteToolDefinition[] {
  return Object.entries(tools).map(([name, toolDef]) => ({
    name,
    description: toolDef.description ?? '',
    inputSchema: asSchema(toolDef.inputSchema as FlexibleSchema<unknown>)
      .jsonSchema,
  }))
}

/**
 * Recording-search tools shared by every assistant agent. Their handlers live
 * in `searchToolHandlers.ts`.
 */
export const recordingSearchTools = {
  searchRequests: tool({
    description:
      'Search for requests in the recording using a query string. Returns metadata only (id, method, url, statusCode) without full request/response bodies. Use this to find specific requests efficiently before fetching full details.',
    inputSchema: z.object({
      query: z
        .string()
        .describe(
          'Search query - can match against URL, method, path, host, status code, request/response header names and values, and request/response body content. Examples: "login", "POST", "/api/users", "401", "content-type", "csrf_token"'
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
} satisfies ToolSet
