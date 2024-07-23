import { describe, expect, it } from 'vitest'

import { stringifyArray, stringifyObject } from './codegen.utils'

describe('Code generation - utils', () => {
  describe('stringifyArray', () => {
    it('should stringify array', () => {
      const array = ['a', 'b', 'c']
      const expectedResult = `['a', 'b', 'c']`

      expect(stringifyArray(array)).toBe(expectedResult)
    })

    it('should stringify empty array', () => {
      const array: string[] = []
      const expectedResult = `[]`

      expect(stringifyArray(array)).toBe(expectedResult)
    })
  })

  describe('stringifyObject', () => {
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

      expect(stringifyObject(obj).replace(/\s/g, '')).toBe(
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

      expect(stringifyObject(obj).replace(/\s/g, '')).toBe(
        expectedResult.replace(/\s/g, '')
      )
    })

    it('should stringify empty object', () => {
      const obj = {}
      const expectedResult = `{}`

      expect(stringifyObject(obj)).toBe(expectedResult)
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

      expect(stringifyObject(obj).replace(/\s/g, '')).toBe(
        expectedResult.replace(/\s/g, '')
      )
    })
  })
})
