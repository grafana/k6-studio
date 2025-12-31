import { describe, it, expect } from 'vitest'

import { createRequest } from '@/test/factories/proxyData'
import { Selector } from '@/types/rules'

import { matchBeginEnd, replaceBeginEnd } from './beginEnd'

describe('Begin-end selector', () => {
  describe('Replacer', () => {
    it('should replace content between two substrings in body', () => {
      const selector: Selector = {
        type: 'begin-end',
        from: 'body',
        begin: '<div>',
        end: '</div>',
      }
      const request = createRequest({ content: '<div>hello</div>' })
      const result = replaceBeginEnd(selector, request, '${correl_0}')?.content
      expect(result).toBe('<div>${correl_0}</div>')
    })

    it('should replace content between two substrings in headers', () => {
      const request = createRequest({
        content: '',
        headers: [
          ['content-type', 'application/json'],
          ['content-length', '1000'],
        ],
      })
      const selector: Selector = {
        type: 'begin-end',
        from: 'headers',
        begin: 'application',
        end: 'json',
      }
      const result = replaceBeginEnd(selector, request, '${correl_0}')?.headers
      expect(result).toEqual([
        ['content-type', 'application${correl_0}json'],
        ['content-length', '1000'],
      ])
    })

    it('should replace content between two substrings in url', () => {
      const request = createRequest({
        url: 'https://quickpizza.grafana.com/api/admin/login?user=admin&password=admin',
        path: '/api/admin/login?user=admin&password=admin',
      })

      const selector: Selector = {
        type: 'begin-end',
        from: 'url',
        begin: 'user=',
        end: '&password',
      }
      const result = replaceBeginEnd(selector, request, '${correl_0}')
      expect(result.url).toBe(
        'https://quickpizza.grafana.com/api/admin/login?user=${correl_0}&password=admin'
      )
      expect(result.path).toBe(
        '/api/admin/login?user=${correl_0}&password=admin'
      )
    })

    it('should not replace anything if begin-end not found', () => {
      const request = createRequest({ content: '<div>hello</div>' })
      const selector: Selector = {
        type: 'begin-end',
        from: 'body',
        begin: '<span>',
        end: '</span>',
      }
      const result = replaceBeginEnd(selector, request, '${correl_0}')
      expect(result).toBe(request)
    })

    it('should replace only the content between begin-end when captured value appears multiple times', () => {
      const selector: Selector = {
        type: 'begin-end',
        from: 'body',
        begin: 'admin_',
        end: '_suffix',
      }
      const request = createRequest({ content: 'admin_admin_suffix' })
      const result = replaceBeginEnd(selector, request, '${correl_0}')?.content
      expect(result).toBe('admin_${correl_0}_suffix')
    })

    it('should not replace anything if begin-end substrings are missing', () => {
      const request = createRequest({ content: 'hello world' })
      const selector: Selector = {
        type: 'begin-end',
        from: 'body',
        begin: '<span>',
        end: '</span>',
      }
      const result = replaceBeginEnd(selector, request, '${correl_0}')
      expect(result).toBe(request)
    })

    it('should not replace anything if begin or end strings are empty', () => {
      const request = createRequest({ content: 'hello world' })
      const selectorBeginEmpty: Selector = {
        type: 'begin-end',
        from: 'body',
        begin: '',
        end: 'world',
      }
      const selectorEndEmpty: Selector = {
        type: 'begin-end',
        from: 'body',
        begin: 'hello',
        end: '',
      }
      const resultBeginEmpty = replaceBeginEnd(
        selectorBeginEmpty,
        request,
        '${correl_0}'
      )
      const resultEndEmpty = replaceBeginEnd(
        selectorEndEmpty,
        request,
        '${correl_0}'
      )
      expect(resultBeginEmpty).toBe(request)
      expect(resultEndEmpty).toBe(request)
    })
  })

  describe('Extractor', () => {
    it('should extract content between begin and end substrings', () => {
      expect(matchBeginEnd('<div>cat</div>', '<div>', '</div>')).toBe('cat')
      expect(matchBeginEnd('jumpinginthelake', 'ing', 'the')).toBe('in')
      expect(matchBeginEnd('hello', '<a>', '</a>')).toBeUndefined()
      // matches only the first occurrence
      expect(
        matchBeginEnd('<div>cat</div><div>bob</div>', '<div>', '</div>')
      ).toBe('cat')
    })

    it('should not extract when begin-end substrings are missing', () => {
      expect(matchBeginEnd('hello world', '<span>', '</span>')).toBeUndefined()
      expect(matchBeginEnd('test string', 'test', 'end')).toBeUndefined()
    })
  })
})
