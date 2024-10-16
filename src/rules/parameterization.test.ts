import { createProxyData, createRequest } from '@/test/factories/proxyData'
import { ParameterizationRule } from '@/types/rules'
import { describe, expect, it } from 'vitest'
import { createParameterizationRuleInstance } from './parameterization'
import { ProxyData } from '@/types'
import {
  headerRule,
  jsonRule,
  urlRule,
} from '@/test/fixtures/parameterizationRules'

describe('applyParameterization', () => {
  it('replaces string value', () => {
    const requestSnippet = createRequestSnippet(
      createProxyData({
        request: createRequest({
          headers: [['content-Type', 'application/json']],
          content: JSON.stringify({ user_id: '123' }),
        }),
      })
    )

    const updatedRequest =
      createParameterizationRuleInstance(jsonRule).apply(requestSnippet)

    expect(updatedRequest.data.request.content).toBe('{"user_id":"TEST_ID"}')
  })

  it('replaces value in URL', () => {
    const requestSnippet = createRequestSnippet(
      createProxyData({
        request: createRequest({
          url: 'http://example.com/api/v1/users?user_id=123&foo=bar',
        }),
      })
    )

    const updatedRequest =
      createParameterizationRuleInstance(urlRule).apply(requestSnippet)

    expect(updatedRequest.data.request.url).toBe(
      'http://example.com/api/v1/users?user_id=TEST_ID&foo=bar'
    )
  })

  it('replaces value in headers', () => {
    const requestSnippet = createRequestSnippet(
      createProxyData({
        request: createRequest({
          headers: [['authorization', 'token 123']],
        }),
      })
    )
    const updatedRequest =
      createParameterizationRuleInstance(headerRule).apply(requestSnippet)

    expect(updatedRequest.data.request.headers).toStrictEqual([
      ['authorization', 'token TEST_TOKEN'],
    ])
  })

  it('replaces variable', () => {
    const requestSnippet = createRequestSnippet(
      createProxyData({
        request: createRequest({
          headers: [['content-Type', 'application/json']],
          content: JSON.stringify({ user_id: '123' }),
        }),
      })
    )

    const variableRule: ParameterizationRule = {
      ...jsonRule,
      value: {
        type: 'variable',
        variableName: 'test_variable',
      },
    }

    const updatedRequest =
      createParameterizationRuleInstance(variableRule).apply(requestSnippet)

    expect(updatedRequest.data.request.content).toBe(
      '{"user_id":"${VARS[\'test_variable\']}"}'
    )
  })

  it('does not apply rule if filter does not match', () => {
    const requestSnippet = createRequestSnippet(
      createProxyData({
        request: createRequest({
          headers: [['content-Type', 'application/json']],
          content: JSON.stringify({ user_id: '123' }),
          url: 'http://example.com/api/v1/',
        }),
      })
    )

    const notMatchingRule = {
      ...jsonRule,
      filter: { path: '/api/v1/users/123' },
    }

    const updatedRequest =
      createParameterizationRuleInstance(notMatchingRule).apply(requestSnippet)

    expect(updatedRequest.data.request.content).toBe('{"user_id":"123"}')
  })

  it('saves replaced requests', () => {
    const requestSnippet = createRequestSnippet(
      createProxyData({
        request: createRequest({
          headers: [['content-Type', 'application/json']],
          content: JSON.stringify({ user_id: '123' }),
        }),
      })
    )

    const ruleInstance = createParameterizationRuleInstance(jsonRule)

    ruleInstance.apply(requestSnippet)

    expect(ruleInstance.state.requestsReplaced[0]?.original).toStrictEqual(
      requestSnippet.data.request
    )

    expect(ruleInstance.state.requestsReplaced[0]?.replaced).toStrictEqual({
      ...requestSnippet.data.request,
      content: '{"user_id":"TEST_ID"}',
    })
  })
  it('supports custom code')
  it('supports array variables')
})

function createRequestSnippet(proxyData: ProxyData) {
  return {
    data: proxyData,
    before: [],
    after: [],
  }
}
