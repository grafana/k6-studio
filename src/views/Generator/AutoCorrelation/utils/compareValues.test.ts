import { describe, it, expect } from 'vitest'

import { compareResponseValues } from './compareValues'
import { StrippedProxyData } from './stripRequestData'

const createMockData = (
  headers: [string, string][] = [],
  content: string | null = null
): StrippedProxyData => ({
  request: {
    method: 'GET',
    url: 'http://test.com',
    path: '/',
    content: null,
    cookies: [],
    headers: [],
  },
  response: {
    statusCode: 200,
    content,
    headers,
    cookies: [],
  },
})

describe('compareResponseValues', () => {
  it('should return no mismatches for identical responses', () => {
    const data = createMockData(
      [['Content-Type', 'application/json']],
      '{"foo":"bar"}'
    )
    const result = compareResponseValues(data, data)

    expect(result.hasMatches).toBe(false)
    expect(result.mismatches).toHaveLength(0)
  })

  it('should handle missing response in expected data', () => {
    const expected = { ...createMockData(), response: undefined }
    const actual = createMockData()

    const result = compareResponseValues(expected, actual)

    expect(result.hasMatches).toBe(false)
    expect(result.mismatches).toHaveLength(0)
  })

  it('should handle missing response in actual data', () => {
    const expected = createMockData()
    const actual = { ...createMockData(), response: undefined }

    const result = compareResponseValues(expected, actual)

    expect(result.hasMatches).toBe(false)
    expect(result.mismatches).toHaveLength(0)
  })

  describe('Headers', () => {
    it('should detect header value mismatch', () => {
      const expected = createMockData([['X-Custom-Header', 'value1']])
      const actual = createMockData([['X-Custom-Header', 'value2']])

      const result = compareResponseValues(expected, actual)

      expect(result.hasMatches).toBe(true)
      expect(result.mismatches).toHaveLength(1)
      expect(result.mismatches[0]).toMatchObject({
        path: 'response.headers.x-custom-header',
        expected: 'value1',
        actual: 'value2',
        location: 'header',
      })
    })

    it('should ignore headers that are in the skip list', () => {
      const expected = createMockData([
        ['Date', 'Tue, 15 Nov 1994 08:12:31 GMT'],
        ['ETag', '12345'],
        ['Content-Length', '100'],
      ])
      const actual = createMockData([
        ['Date', 'Wed, 16 Nov 1994 08:12:31 GMT'],
        ['ETag', '67890'],
        ['Content-Length', '200'],
      ])

      const result = compareResponseValues(expected, actual)

      expect(result.hasMatches).toBe(false)
      expect(result.mismatches).toHaveLength(0)
    })

    it('should match headers case-insensitively', () => {
      const expected = createMockData([['X-Custom-Header', 'value1']])
      const actual = createMockData([['x-custom-header', 'value1']])

      const result = compareResponseValues(expected, actual)

      expect(result.hasMatches).toBe(false)
      expect(result.mismatches).toHaveLength(0)
    })

    it('should handle Set-Cookie normalization', () => {
      const expected = createMockData([['Set-Cookie', 'session=123; Path=/']])
      const actual = createMockData([['Set-Cookie', 'session=456; Path=/']])

      const result = compareResponseValues(expected, actual)

      expect(result.hasMatches).toBe(true)
      expect(result.mismatches[0]?.path).toBe(
        'response.headers.set-cookie.session'
      )
      expect(result.mismatches[0]?.expected).toBe('session=123; Path=/')
      expect(result.mismatches[0]?.actual).toBe('session=456; Path=/')
    })

    it('should not report mismatch if header is missing in actual', () => {
      const expected = createMockData([['X-Required', 'true']])
      const actual = createMockData([])

      const result = compareResponseValues(expected, actual)

      expect(result.hasMatches).toBe(false)
    })
  })

  describe('Body Content', () => {
    it('should detect mismatch in simple JSON fields', () => {
      const expected = createMockData(
        [],
        JSON.stringify({ name: 'Alice', age: 30 })
      )
      const actual = createMockData(
        [],
        JSON.stringify({ name: 'Bob', age: 30 })
      )

      const result = compareResponseValues(expected, actual)

      expect(result.hasMatches).toBe(true)
      expect(result.mismatches).toHaveLength(1)
      expect(result.mismatches[0]).toMatchObject({
        path: 'response.body.name',
        expected: 'Alice',
        actual: 'Bob',
      })
    })

    it('should detect mismatch in nested JSON objects', () => {
      const expected = createMockData(
        [],
        JSON.stringify({ user: { settings: { theme: 'dark' } } })
      )
      const actual = createMockData(
        [],
        JSON.stringify({ user: { settings: { theme: 'light' } } })
      )

      const result = compareResponseValues(expected, actual)

      expect(result.hasMatches).toBe(true)
      expect(result.mismatches[0]).toMatchObject({
        path: 'response.body.user.settings.theme',
        expected: 'dark',
        actual: 'light',
      })
    })

    it('should detect mismatch in arrays within JSON', () => {
      const expected = createMockData([], JSON.stringify({ items: [1, 2, 3] }))
      const actual = createMockData([], JSON.stringify({ items: [1, 4, 3] }))

      const result = compareResponseValues(expected, actual)

      expect(result.hasMatches).toBe(true)
      expect(result.mismatches[0]).toMatchObject({
        path: 'response.body.items[1]',
        expected: '2',
        actual: '4',
      })
    })

    it('should ignore array comparison if lengths differ', () => {
      const expected = createMockData([], JSON.stringify({ items: [1, 2] }))
      const actual = createMockData([], JSON.stringify({ items: [1, 2, 3] }))

      const result = compareResponseValues(expected, actual)

      expect(result.hasMatches).toBe(false)
    })

    it('should compare non-JSON content', () => {
      const expected = createMockData([], 'Hello World')
      const actual = createMockData([], 'Hello Universe')

      const result = compareResponseValues(expected, actual)

      expect(result.hasMatches).toBe(true)
      expect(result.mismatches[0]).toMatchObject({
        path: 'response.content',
        expected: 'Hello World',
        actual: 'Hello Universe',
      })
    })

    it('should ignore non-JSON content mismatches if content is too large', () => {
      const largeString1 = 'a'.repeat(4001)
      const largeString2 = 'b'.repeat(4001)
      const expected = createMockData([], largeString1)
      const actual = createMockData([], largeString2)

      const result = compareResponseValues(expected, actual)

      expect(result.hasMatches).toBe(false)
    })

    it('should handle mixed content types (JSON vs non-JSON)', () => {
      const expected = createMockData([], JSON.stringify({ foo: 'bar' }))
      const actual = createMockData([], 'invalid json')

      const result = compareResponseValues(expected, actual)

      expect(result.hasMatches).toBe(true)
      expect(result.mismatches[0]?.path).toBe('response.content')
    })

    it('should limit recursion depth', () => {
      const deepObj = {
        level1: {
          level2: {
            level3: { level4: { level5: { level6: { final: 'value' } } } },
          },
        },
      }
      const deepObjDifferent = {
        level1: {
          level2: {
            level3: { level4: { level5: { level6: { final: 'diff' } } } },
          },
        },
      }

      const expected = createMockData([], JSON.stringify(deepObj))
      const actual = createMockData([], JSON.stringify(deepObjDifferent))

      const result = compareResponseValues(expected, actual)

      // Should be ignored because depth > 5
      expect(result.hasMatches).toBe(false)
    })
  })
})
