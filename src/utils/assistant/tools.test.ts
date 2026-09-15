import { describe, expect, it } from 'vitest'

import { recordingSearchTools, serializeToolDefinitions } from './tools'

describe('serializeToolDefinitions', () => {
  it('preserves optional search inputs across the IPC serialization boundary', () => {
    const definitions = serializeToolDefinitions(recordingSearchTools)

    expect(JSON.parse(JSON.stringify(definitions))).toEqual(definitions)
    expect(definitions).toMatchObject([
      {
        name: 'searchRequests',
        inputSchema: {
          required: ['query'],
          properties: {
            limit: { type: 'number', default: 20 },
          },
        },
      },
      {
        name: 'getRequestsMetadata',
        inputSchema: {
          properties: {
            startIndex: { type: 'number', default: 0 },
            endIndex: { type: 'number' },
          },
        },
      },
      {
        name: 'getRequestDetails',
        inputSchema: { required: ['requestIds'] },
      },
    ])
    expect(definitions[1]?.inputSchema.required ?? []).toEqual([])
  })
})
