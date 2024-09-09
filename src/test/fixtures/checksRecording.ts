import { ProxyData } from '@/types'

export const checksRecording: ProxyData[] = [
  {
    id: '1',
    request: {
      method: 'POST',
      url: 'http://test.k6.io/api/v1/foo',
      headers: [],
      cookies: [],
      query: [],
      scheme: 'http',
      host: 'localhost:3000',
      content: '',
      path: '/api/v1/foo',
      timestampStart: 0,
      timestampEnd: 0,
      contentLength: 0,
      httpVersion: '1.1',
    },
    response: {
      statusCode: 200,
      path: '/api/v1/foo',
      reason: 'OK',
      httpVersion: '1.1',
      headers: [['Content-Type', 'application/json']],
      cookies: [],
      content: JSON.stringify({ user_id: '444' }),
      contentLength: 0,
      timestampStart: 0,
    },
  },
]
