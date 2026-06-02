import { describe, expect, it } from 'vitest'

import {
  createProxyData,
  createRequest,
  createResponse,
} from '@/test/factories/proxyData'
import type { ProxyData } from '@/types'
import type { AiCorrelationRule } from '@/types/autoCorrelation'

import { computeAddRuleResult } from './computeAddRuleResult'

function createMatchingRecording(): ProxyData[] {
  return [
    createProxyData({
      id: 'req-1',
      response: createResponse({
        content: JSON.stringify({ token: 'abc123' }),
      }),
    }),
    createProxyData({
      id: 'req-2',
      request: createRequest({
        url: 'http://example.com/api/v1/users?token=abc123',
        path: '/api/v1/users',
      }),
      response: createResponse(),
    }),
  ]
}

function createAiRule(
  overrides?: Partial<AiCorrelationRule['extractor']>
): AiCorrelationRule {
  return {
    extractor: {
      filter: { path: '' },
      selector: {
        type: 'json',
        from: 'body',
        path: 'token',
      },
      variableName: 'auth_token',
      extractionMode: 'single',
      ...overrides,
    },
  }
}

describe('computeAddRuleResult', () => {
  it('returns ok with matched request ids when rule matches', () => {
    const recording = createMatchingRecording()
    const aiRule = createAiRule()

    const result = computeAddRuleResult(aiRule, [], recording)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.matchedRequestIds).toContain('req-2')
    expect(result.matchedRequestIds.length).toBeGreaterThan(0)
    expect(result.correlationState).toBeDefined()
    expect(result.rule.type).toBe('correlation')
  })

  it('returns failure when rule matches zero requests', () => {
    const recording = [
      createProxyData({
        id: 'req-1',
        response: createResponse({
          content: JSON.stringify({ unrelated: 'value' }),
        }),
      }),
    ]
    const aiRule = createAiRule()

    const result = computeAddRuleResult(aiRule, [], recording)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.reason).toContain('did not match any requests')
  })

  it('returns failure when filter excludes all requests', () => {
    const recording = [createProxyData({ id: 'req-1' })]
    const aiRule = createAiRule({
      filter: { path: '/nonexistent' },
      selector: {
        type: 'json',
        from: 'body',
        path: 'missing',
      },
    })

    const result = computeAddRuleResult(aiRule, [], recording)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.reason).toContain('did not match any requests')
  })

  it('uses variableName from aiRule extractor when present', () => {
    const recording = createMatchingRecording()
    const aiRule = createAiRule({ variableName: 'session_id' })

    const result = computeAddRuleResult(aiRule, [], recording)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.variableName).toBe('session_id')
  })

  it('falls back to "rule" when variableName is not provided', () => {
    const recording = createMatchingRecording()
    const aiRule = {
      extractor: {
        filter: { path: '' },
        selector: {
          type: 'json' as const,
          from: 'body' as const,
          path: 'token',
        },
        extractionMode: 'single' as const,
      },
    } as AiCorrelationRule

    const result = computeAddRuleResult(aiRule, [], recording)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.variableName).toBe('rule')
  })

  it('generates rule with autocorrelation prefix, correlation type, and enabled', () => {
    const recording = createMatchingRecording()
    const aiRule = createAiRule()

    const result = computeAddRuleResult(aiRule, [], recording)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.rule.id).toMatch(/^autocorrelation_rule_/)
    expect(result.rule.type).toBe('correlation')
    expect(result.rule.enabled).toBe(true)
  })
})
