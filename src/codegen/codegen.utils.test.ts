import { describe, expect, it } from 'vitest'

import { createRequest, createProxyData } from '@/test/factories/proxyData'

import { stringify, removeWebsocketRequests } from './codegen.utils'

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
