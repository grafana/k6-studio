import { describe, it, expect } from 'vitest'

import { createRequest } from '@/test/factories/proxyData'
import { Selector } from '@/types/rules'

import { getJsonObjectFromPath, replaceJsonBody } from './json'

describe('JSON selector', () => {
  describe('Replacer', () => {
    it('should replace json value from path in body', () => {
      const selector: Selector = {
        type: 'json',
        from: 'body',
        path: 'hello',
      }
      const request = createRequest({
        content: '{"hello":"world"}',
        headers: [['content-type', 'application/json']],
      })
      const result = replaceJsonBody(selector, request, '${correl_0}').content
      expect(result).toBe('{"hello":"${correl_0}"}')
    })

    it('should not replace anything if json path not found', () => {
      const request = createRequest({
        content: '{"hello":"world"}',
        headers: [['content-type', 'application/json']],
      })
      const selector: Selector = {
        type: 'json',
        from: 'body',
        path: 'notfound',
      }
      const result = replaceJsonBody(selector, request, '${correl_0}')
      expect(result).toBe(request)
    })
  })

  describe('Extractor', () => {
    it('should extract json value from path', () => {
      expect(getJsonObjectFromPath('{"hello":"world"}', 'hello')).toBe('world')
      expect(
        getJsonObjectFromPath('{"hello":"world"}', 'world')
      ).toBeUndefined()
      expect(getJsonObjectFromPath('[{"hello":"world"}]', '[0].hello')).toBe(
        'world'
      )
      expect(getJsonObjectFromPath('hello', '[0]')).toBeUndefined()
    })
  })
})
