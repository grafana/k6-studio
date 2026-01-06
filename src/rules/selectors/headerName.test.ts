import { describe, it, expect } from 'vitest'

import { createRequest } from '@/test/factories/proxyData'
import { Selector } from '@/types/rules'

import { replaceHeaderByName } from './headerName'

describe('Header name selector', () => {
  describe('Replacer', () => {
    it('should replace header value by name', () => {
      const request = createRequest({
        headers: [
          ['content-type', 'application/json'],
          ['content-length', '1000'],
        ],
      })
      const selector: Selector = {
        type: 'header-name',
        from: 'headers',
        name: 'Content-Type',
      }
      const result = replaceHeaderByName(
        request,
        selector,
        'TEST_VALUE'
      )?.headers
      expect(result).toEqual([
        ['content-type', 'TEST_VALUE'],
        ['content-length', '1000'],
      ])
    })

    it('should not replace anything if header name not found', () => {
      const request = createRequest({
        headers: [
          ['content-type', 'application/json'],
          ['content-length', '1000'],
        ],
      })
      const selector: Selector = {
        type: 'header-name',
        from: 'headers',
        name: 'not-existing',
      }
      const result = replaceHeaderByName(request, selector, 'TEST_VALUE')
      expect(result).toBe(request)
    })
  })
})
