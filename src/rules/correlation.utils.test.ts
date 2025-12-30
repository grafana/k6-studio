import { describe, expect, it } from 'vitest'

import { Request } from '@/types'
import { CorrelationRule } from '@/types/rules'

import { replaceCorrelatedValues } from './correlation.utils'

describe('replaceCorrelatedValues', () => {
  it('should replace all occurrences when no selector is provided', () => {
    const request: Request = {
      method: 'POST',
      url: 'http://test.k6.io/api/v1/helloworld',
      headers: [['hello', 'world']],
      cookies: [['cookie', 'helloworld']],
      query: [],
      scheme: 'http',
      host: 'localhost:3000',
      content: 'hello world',
      path: '/api/v1/helloworld',
      timestampStart: 0,
      timestampEnd: 0,
      contentLength: 0,
      httpVersion: '1.1',
    }

    const rule: CorrelationRule = {
      id: '1',
      type: 'correlation',
      extractor: {
        filter: { path: '' },
        selector: {
          from: 'url',
          type: 'begin-end',
          begin: 'hello',
          end: 'world',
        },
        variableName: 'test',
        extractionMode: 'single',
      },
      enabled: true,
    }

    const result = replaceCorrelatedValues({
      request,
      rule,
      extractedValue: 'world',
      uniqueId: 0,
    })!

    expect(result).toBeDefined()
    expect(result.content).toBe("hello ${correlation_vars['correlation_0']}")
    expect(result.url).toBe(
      "http://test.k6.io/api/v1/hello${correlation_vars['correlation_0']}"
    )
    expect(result.headers[0]![1]).toBe("${correlation_vars['correlation_0']}")
    expect(result.cookies[0]![1]).toBe(
      "hello${correlation_vars['correlation_0']}"
    )
  })
})
