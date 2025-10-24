import { describe, expect, test } from 'vitest'

import { Recording, RecordingSchema } from '@/schemas/recording'

const mockRecording: Recording = {
  log: {
    version: '1.2',
    creator: {
      name: 'k6-studio',
      version: '1.2.3',
    },
    entries: [
      {
        startedDateTime: '2024-01-01T12:00:00.000Z',
        time: 200,
        cache: {},
        timings: {
          send: 20,
          wait: 150,
          receive: 30,
        },

        request: {
          httpVersion: 'HTTP/1.1',
          cookies: [],
          queryString: [],
          method: 'POST',
          url: 'http://quickpizza.grafana.com/login',
          headers: [
            {
              name: 'Content-Type',
              value: 'application/json',
            },
          ],
          headersSize: 150,
          bodySize: 45,
          postData: {
            mimeType: 'application/json',
            text: '{"user":"admin","password":"123"}',
          },
        },
      },
    ],
  },
}

describe('RecordingSchema', () => {
  test('Should successfully parse a valid recording', () => {
    const result = RecordingSchema.safeParse(mockRecording)
    expect(result.success).toBe(true)
  })
})
