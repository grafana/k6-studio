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
        request: {
          method: 'POST',
          url: 'http://quickpizza.grafana.com/login',
          headers: [
            {
              name: 'Content-Type',
              value: 'application/json',
            },
          ],
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
