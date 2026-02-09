import { describe, expect, it } from 'vitest'

import {
  createRequest,
  createResponse,
  createProxyData,
} from '@/test/factories/proxyData'
import { RequestSnippetSchema } from '@/types'

import {
  stringify,
  removeWebsocketRequests,
  processRedirectChains,
} from './codegen.utils'

describe('Code generation - utils', () => {
  describe('stringify', () => {
    it('should stringify primitive typs', () => {
      expect(stringify('string')).toBe(`'string'`)
      expect(stringify(5)).toBe('5')
      expect(stringify(true)).toBe('true')
      expect(stringify(null)).toBe('null')
      expect(stringify(undefined)).toBe('undefined')
    })

    it('should stringify array', () => {
      const array = ['a', 'b', 'c']
      const expectedResult = `['a', 'b', 'c']`

      expect(stringify(array)).toBe(expectedResult)
    })

    it('should stringify empty array', () => {
      const array: string[] = []
      const expectedResult = `[]`

      expect(stringify(array)).toBe(expectedResult)
    })

    it('should stringify object', () => {
      const obj = {
        key1: 'value1',
        key2: 2,
        key3: true,
      }
      const expectedResult = `{
        key1: 'value1',
        key2: 2,
        key3: true
      }`

      expect(stringify(obj).replace(/\s/g, '')).toBe(
        expectedResult.replace(/\s/g, '')
      )
    })

    it('should stringify object with undefined values', () => {
      const obj = {
        key1: 'value1',
        key2: undefined,
        key3: true,
      }
      const expectedResult = `{
        key1: 'value1',
        key3: true
      }`

      expect(stringify(obj).replace(/\s/g, '')).toBe(
        expectedResult.replace(/\s/g, '')
      )
    })

    it('should stringify empty object', () => {
      const obj = {}
      const expectedResult = `{}`

      expect(stringify(obj)).toBe(expectedResult)
    })

    it('should stringify nested object', () => {
      const obj = {
        key1: 'value1',
        key2: {
          key3: ['value3', 5],
          key4: 4,
        },
      }

      const expectedResult = `{
        key1: 'value1',
        key2: {
          key3: ['value3', 5],
          key4: 4
        }
      }`

      expect(stringify(obj).replace(/\s/g, '')).toBe(
        expectedResult.replace(/\s/g, '')
      )
    })
  })

  function toSnippet(
    data: ReturnType<typeof createProxyData>
  ): RequestSnippetSchema {
    return { data, before: [], after: [], checks: [] }
  }

  const createRedirectSnippet = (id: string, from: string, to: string) => {
    return toSnippet(
      createProxyData({
        id,
        request: createRequest({ url: from }),
        response: createResponse({
          statusCode: 302,
          headers: [['location', to]],
        }),
      })
    )
  }

  const createFinalSnippet = (id: string, url: string, content = 'Final') => {
    return toSnippet(
      createProxyData({
        id,
        request: createRequest({ url }),
        response: createResponse({ statusCode: 200, content }),
      })
    )
  }

  describe('processRedirectChains', () => {
    it('merges chain when no requests are affected', () => {
      const first = createRedirectSnippet('1', 'http://a.com', 'http://b.com')
      const final = createFinalSnippet('2', 'http://b.com', 'Final Content')

      const result = processRedirectChains([first, final], new Set())

      expect(result.length).toBe(1)
      expect(result[0]?.data.id).toBe('1')
      expect(result[0]?.data.response?.content).toBe('Final Content')
      expect(result[0]?.noRedirect).toBeFalsy()
    })

    it('keeps chain separate when first request is affected', () => {
      const first = createRedirectSnippet('1', 'http://a.com', 'http://b.com')
      const final = createFinalSnippet('2', 'http://b.com')

      const result = processRedirectChains([first, final], new Set(['1']))

      expect(result.length).toBe(2)
      expect(result[0]?.noRedirect).toBe(true)
      expect(result[1]?.noRedirect).toBe(false)
    })

    it('keeps chain separate when middle request is affected', () => {
      const snippets = [
        createRedirectSnippet('1', 'http://a.com', 'http://b.com'),
        createRedirectSnippet('2', 'http://b.com', 'http://c.com'),
        createFinalSnippet('3', 'http://c.com'),
      ]

      const result = processRedirectChains(snippets, new Set(['2']))

      expect(result.length).toBe(3)
      expect(result[0]?.noRedirect).toBe(true)
      expect(result[1]?.noRedirect).toBe(true)
      expect(result[2]?.noRedirect).toBe(false)
    })

    it('resolves relative URLs correctly across domains', () => {
      const snippets = [
        toSnippet(
          createProxyData({
            id: '1',
            request: createRequest({ url: 'http://domain1.com/start' }),
            response: createResponse({
              statusCode: 302,
              headers: [['location', 'http://domain2.com/auth']],
            }),
          })
        ),
        toSnippet(
          createProxyData({
            id: '2',
            request: createRequest({ url: 'http://domain2.com/auth' }),
            response: createResponse({
              statusCode: 302,
              headers: [['location', '/callback']],
            }),
          })
        ),
        createFinalSnippet('3', 'http://domain2.com/callback'),
      ]

      const result = processRedirectChains(snippets, new Set())

      expect(result.length).toBe(1)
      expect(result[0]?.data.id).toBe('1')
    })

    it('only merges unaffected chains when multiple chains exist', () => {
      const snippets = [
        createRedirectSnippet('1', 'http://a.com', 'http://b.com'),
        createFinalSnippet('2', 'http://b.com'),
        createRedirectSnippet('3', 'http://c.com', 'http://d.com'),
        createFinalSnippet('4', 'http://d.com'),
      ]

      const result = processRedirectChains(snippets, new Set(['3']))

      expect(result.length).toBe(3)
      expect(result[0]?.data.id).toBe('1')
      expect(result[1]?.data.id).toBe('3')
      expect(result[2]?.data.id).toBe('4')
      expect(result[1]?.noRedirect).toBe(true)
    })

    it('keeps redirect unchanged when target URL is not in recording', () => {
      const redirect = createRedirectSnippet(
        '1',
        'http://a.com',
        'http://missing.com'
      )

      const result = processRedirectChains([redirect], new Set())

      expect(result.length).toBe(1)
      expect(result[0]?.data.id).toBe('1')
      expect(result[0]?.data.response?.statusCode).toBe(302)
      expect(result[0]?.noRedirect).toBeFalsy()
    })

    it('handles same URL appearing in multiple independent chains', () => {
      const snippets = [
        createRedirectSnippet('1', 'http://a.com', 'http://shared.com'),
        createFinalSnippet('2', 'http://shared.com', 'First chain'),
        createRedirectSnippet('3', 'http://b.com', 'http://shared.com'),
        createFinalSnippet('4', 'http://shared.com', 'Second chain'),
      ]

      const result = processRedirectChains(snippets, new Set())

      expect(result.length).toBe(2)
      expect(result[0]?.data.id).toBe('1')
      expect(result[0]?.data.response?.content).toBe('First chain')
      expect(result[1]?.data.id).toBe('3')
      expect(result[1]?.data.response?.content).toBe('Second chain')
    })

    it("uses final request's checks in a redirect chain", () => {
      const redirectWithCheck = {
        ...createRedirectSnippet('1', 'http://a.com', 'http://b.com'),
        checks: [
          {
            description: 'status equals 302',
            expression: '(r) => r.status === 302',
          },
        ],
      }
      const finalWithCheck = {
        ...createFinalSnippet('2', 'http://b.com'),
        checks: [
          {
            description: 'status equals 200',
            expression: '(r) => r.status === 200',
          },
        ],
      }

      const result = processRedirectChains(
        [redirectWithCheck, finalWithCheck],
        new Set()
      )

      expect(result.length).toBe(1)
      expect(result[0]?.data.id).toBe('1')
      expect(result[0]?.data.response?.statusCode).toBe(200)
      expect(result[0]?.checks).toEqual([
        {
          description: 'status equals 200',
          expression: '(r) => r.status === 200',
        },
      ])
    })

    it('keeps checks for affected redirect chains', () => {
      const redirectWithCheck = {
        ...createRedirectSnippet('1', 'http://a.com', 'http://b.com'),
        checks: [
          {
            description: 'status equals 302',
            expression: '(r) => r.status === 302',
          },
        ],
      }
      const finalWithCheck = {
        ...createFinalSnippet('2', 'http://b.com'),
        checks: [
          {
            description: 'status equals 200',
            expression: '(r) => r.status === 200',
          },
        ],
      }

      const result = processRedirectChains(
        [redirectWithCheck, finalWithCheck],
        new Set(['1'])
      )

      expect(result.length).toBe(2)
      expect(result[0]?.checks).toEqual([
        {
          description: 'status equals 302',
          expression: '(r) => r.status === 302',
        },
      ])
      expect(result[1]?.checks).toEqual([
        {
          description: 'status equals 200',
          expression: '(r) => r.status === 200',
        },
      ])
    })
  })

  describe('removeWebsocketRequests', () => {
    it('remove websocket requests', () => {
      const websocketRequest = createProxyData({
        request: createRequest({ headers: [['upgrade', 'websocket']] }),
      })
      const normalRequest = createProxyData()

      const recording = [websocketRequest, normalRequest]

      expect(removeWebsocketRequests(recording)).toEqual([{ ...normalRequest }])
    })
  })
})
