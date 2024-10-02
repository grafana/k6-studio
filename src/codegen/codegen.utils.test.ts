import { describe, expect, it } from 'vitest'

import { mergeRedirects, stringify } from './codegen.utils'
import {
  createRequest,
  createResponse,
  createProxyData,
} from '@/test/factories/proxyData'

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

  describe('mergeRedirects', () => {
    const createRedirectMock = (id: string, from: string, to: string) => {
      const request = createRequest({ url: from })
      const response = createResponse({
        statusCode: 301,
        headers: [['location', to]],
      })
      return createProxyData({ id, request, response })
    }

    it('should return only the first request and last response', () => {
      const first = createRedirectMock(
        '1',
        'http://first.com',
        'http://second.com'
      )
      const last = createProxyData({
        id: '4',
        request: createRequest({ url: 'http://last.com' }),
        response: createResponse({ content: "I'm the last one" }),
      })

      const recording = [
        first,
        createRedirectMock('2', 'http://second.com', 'http://third.com'),
        createRedirectMock('3', 'http://third.com', 'http://last.com'),
        last,
      ]

      expect(mergeRedirects(recording)).toEqual([
        { ...first, response: last.response },
      ])
    })

    it('should not change the request if a redirect is not found', () => {
      const redirect = createRedirectMock(
        '1',
        'http://first.com',
        'http://not-present-in-recording.com'
      )
      const recording = [redirect, createProxyData({ id: '2' })]

      expect(mergeRedirects(recording)).toEqual(recording)
    })
  })
})
