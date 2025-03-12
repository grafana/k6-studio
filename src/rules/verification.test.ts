import { createVerificationRuleInstance } from './verification'
import { RequestSnippetSchema } from '@/types'
import { VerificationRule } from '@/types/rules'
import { describe, it, expect } from 'vitest'
import {
  createProxyData,
  createRequest,
  createResponse,
} from '@/test/factories/proxyData'

const createMockVerificationRule = (
  overrides?: Partial<VerificationRule>
): VerificationRule => ({
  type: 'verification',
  id: 'test-id',
  enabled: true,
  filter: { path: '' },
  operator: 'equals',
  target: 'status',
  value: {
    type: 'recordedValue',
  },
  ...overrides,
})

const createMockRequestSnippet = (options?: {
  response?: Parameters<typeof createResponse>[0]
  afterSnippets?: string[]
  request?: Parameters<typeof createRequest>[0]
}): RequestSnippetSchema => ({
  data: createProxyData({
    response: createResponse(options?.response),
    request: createRequest(options?.request),
  }),
  before: [],
  after: options?.afterSnippets ?? [],
})

const createInstance = (rule = createMockVerificationRule()) =>
  createVerificationRuleInstance(rule)

describe('createVerificationRuleInstance', () => {
  describe('basic functionality', () => {
    it('verifies status code matches recorded value', () => {
      const instance = createInstance()
      const mockRequestSnippet = createMockRequestSnippet({
        response: { statusCode: 200 },
      })

      const result = instance.apply(mockRequestSnippet)

      expect(result.after).toHaveLength(1)
      expect(result.after[0]).toContain(
        "'status equals recorded value': (r) => r.status === 200"
      )
    })

    it('skips verification when request does not match filter', () => {
      const instance = createInstance(
        createMockVerificationRule({
          filter: { path: '/api/v1/users' },
        })
      )

      const mockRequestSnippet = createMockRequestSnippet({
        response: { statusCode: 200 },
        request: {
          path: '/api/v1/posts',
          url: 'http://example.com/api/v1/posts',
        },
      })

      const result = instance.apply(mockRequestSnippet)

      expect(result.after).toHaveLength(0)
    })
  })

  describe('operators', () => {
    it('supports equal operator', () => {
      const instance = createInstance(
        createMockVerificationRule({
          operator: 'equals',
        })
      )

      const mockRequestSnippet = createMockRequestSnippet({
        response: { statusCode: 200 },
      })

      const result = instance.apply(mockRequestSnippet)

      expect(result.after).toHaveLength(1)
      expect(result.after[0]).toContain(
        "'status equals recorded value': (r) => r.status === 200"
      )
    })

    it('supports contains operator', () => {
      const instance = createInstance(
        createMockVerificationRule({
          operator: 'contains',
          target: 'body',
          value: { type: 'string', value: 'success' },
        })
      )

      const mockRequestSnippet = createMockRequestSnippet({
        response: { content: 'Operation completed successfully' },
      })

      const result = instance.apply(mockRequestSnippet)

      expect(result.after).toHaveLength(1)
      expect(result.after[0]).toContain(
        "'body contains success': (r) => r.body.includes('success')"
      )
    })

    it('supports not contains operator', () => {
      const instance = createInstance(
        createMockVerificationRule({
          operator: 'notContains',
          target: 'body',
          value: { type: 'string', value: 'error' },
        })
      )

      const mockRequestSnippet = createMockRequestSnippet({
        response: { content: 'Operation completed successfully' },
      })

      const result = instance.apply(mockRequestSnippet)

      expect(result.after).toHaveLength(1)
      expect(result.after[0]).toContain(
        "'body does not contain error': (r) => !r.body.includes('error')"
      )
    })
  })

  describe('value types', () => {
    it('supports recordedValue type', () => {
      const instance = createInstance(
        createMockVerificationRule({
          value: { type: 'recordedValue' },
        })
      )

      const mockRequestSnippet = createMockRequestSnippet({
        response: { statusCode: 200 },
      })

      const result = instance.apply(mockRequestSnippet)

      expect(result.after).toHaveLength(1)
      expect(result.after[0]).toContain(
        "'status equals recorded value': (r) => r.status === 200"
      )
    })

    it('supports string type', () => {
      const instance = createInstance(
        createMockVerificationRule({
          value: { type: 'string', value: '404' },
        })
      )

      const mockRequestSnippet = createMockRequestSnippet({
        response: { statusCode: 404 },
      })

      const result = instance.apply(mockRequestSnippet)

      expect(result.after).toHaveLength(1)
      expect(result.after[0]).toContain(
        "'status equals 404': (r) => r.status === 404"
      )
    })

    it('supports variable type', () => {
      const instance = createInstance(
        createMockVerificationRule({
          value: { type: 'variable', variableName: 'username' },
          operator: 'contains',
          target: 'body',
        })
      )

      const mockRequestSnippet = createMockRequestSnippet({
        response: { statusCode: 200 },
      })

      const result = instance.apply(mockRequestSnippet)

      expect(result.after).toHaveLength(1)
      expect(result.after[0]).toContain(
        "'body contains variable \"username\"': (r) => r.body.includes(VARS['username'])"
      )
    })

    it('parses variable as number when target is status', () => {
      const instance = createInstance(
        createMockVerificationRule({
          value: { type: 'variable', variableName: 'expected_status' },
          target: 'status',
          operator: 'equals',
        })
      )

      const mockRequestSnippet = createMockRequestSnippet({
        response: { statusCode: 200 },
      })

      const result = instance.apply(mockRequestSnippet)

      expect(result.after).toHaveLength(1)
      expect(result.after[0]).toContain(
        "'status equals variable \"expected_status\"': (r) => r.status === Number(VARS['expected_status'])"
      )
    })
  })

  describe('verification target', () => {
    it('supports status target', () => {
      const instance = createInstance(
        createMockVerificationRule({
          target: 'status',
        })
      )

      const mockRequestSnippet = createMockRequestSnippet({
        response: { statusCode: 200 },
      })

      const result = instance.apply(mockRequestSnippet)

      expect(result.after).toHaveLength(1)
      expect(result.after[0]).toContain(
        "'status equals recorded value': (r) => r.status === 200"
      )
    })

    it('supports body target', () => {
      const instance = createInstance(
        createMockVerificationRule({
          target: 'body',
          value: { type: 'string', value: 'success' },
        })
      )

      const mockRequestSnippet = createMockRequestSnippet({
        response: { content: 'Operation completed successfully' },
      })

      const result = instance.apply(mockRequestSnippet)

      expect(result.after).toHaveLength(1)
      expect(result.after[0]).toContain(
        "'body equals success': (r) => r.body === 'success'"
      )
    })

    it('supports body comparison with recorded value', () => {
      const instance = createInstance(
        createMockVerificationRule({
          target: 'body',
          value: { type: 'recordedValue' },
        })
      )

      const mockRequestSnippet = createMockRequestSnippet({
        response: { content: 'Operation completed successfully' },
      })

      const result = instance.apply(mockRequestSnippet)

      expect(result.after).toHaveLength(1)
      expect(result.after[0]).toContain(
        "'body equals recorded value': (r) => r.body.replace(/(?:\\r\\n|\\r|\\n)/g, '') === String.raw`Operation completed successfully`"
      )
    })
  })
})
