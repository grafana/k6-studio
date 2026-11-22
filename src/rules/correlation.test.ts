import { runInNewContext } from 'node:vm'
import { describe, expect, it } from 'vitest'

import {
  createProxyData,
  createRequest,
  createResponse,
} from '@/test/factories/proxyData'
import { RegexSelector } from '@/types/rules'

import { createCorrelationRuleInstance } from './correlation'
import { matchRegex } from './selectors/regex'
import { generateSequentialInt } from './utils'

function createInstance(from: RegexSelector['from'], regex: string) {
  return createCorrelationRuleInstance(
    {
      type: 'correlation',
      id: '1',
      enabled: true,
      extractor: {
        filter: { path: '' },
        selector: { type: 'regex', from, regex },
        extractionMode: 'single',
      },
    },
    generateSequentialInt()
  )
}

function createData(content: string) {
  return createProxyData({
    request: createRequest({ url: `https://example.com/${content}` }),
    response: createResponse({ content, headers: [['x-token', content]] }),
  })
}

describe.each<RegexSelector['from']>(['body', 'headers', 'url'])(
  'Generated correlation extraction from %s',
  (from) => {
    it.each([
      ['token=[a-z0-9]+', 'token=abc123', 'token=abc123'],
      ['token=([a-z0-9]+)', 'token=abc123', 'abc123'],
      ['token=([a-z0-9]*)', 'token=', ''],
      ['token=(abc)?', 'token=', 'token='],
      ['token=(\\w+)', 'token=abc123', 'abc123'],
      ["token='(\\w+)'", "token='abc123'", 'abc123'],
    ])('matches preview for %s against %s', (regex, content, expected) => {
      const instance = createInstance(from, regex)
      const snippet = instance.apply({
        // The recording needs a nonempty match to emit extraction for an empty runtime capture.
        data: createData(expected === '' ? 'token=abc123' : content),
        before: [],
        after: [],
        checks: [],
      })
      const correlation_vars: Record<string, string | undefined> = {}

      runInNewContext(snippet.after.join('\n'), {
        resp: {
          body: content,
          headers: { 'X-Token': content },
          url: `https://example.com/${content}`,
        },
        correlation_vars,
      })

      expect(matchRegex(content, regex)).toBe(expected)
      expect(correlation_vars.correlation_0).toBe(expected)
    })
  }
)
