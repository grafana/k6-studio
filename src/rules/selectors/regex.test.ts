import { describe, it, expect } from 'vitest'

import { createRequest } from '@/test/factories/proxyData'
import { Selector } from '@/types/rules'

import { replaceRegex, matchRegex } from './regex'

describe('Regex selector', () => {
  describe('Replacer', () => {
    it('should replace content using regex in body', () => {
      const selector: Selector = {
        type: 'regex',
        from: 'body',
        regex: '<div>(.*?)</div>',
      }
      const request = createRequest({ content: '<div>hello</div>' })
      const result = replaceRegex(selector, request, '${correl_0}')?.content
      expect(result).toBe('<div>${correl_0}</div>')
    })

    it('should replace content using regex in headers', () => {
      const request = createRequest({
        headers: [
          ['content-type', 'application/json'],
          ['content-length', '1000'],
        ],
      })
      const selector: Selector = {
        type: 'regex',
        from: 'headers',
        regex: 'application(.*?)json',
      }
      const result = replaceRegex(selector, request, '${correl_0}')?.headers
      expect(result).toEqual([
        ['content-type', 'application${correl_0}json'],
        ['content-length', '1000'],
      ])
    })

    it('should replace content using regex in url', () => {
      const request = createRequest({
        url: 'https://quickpizza.grafana.com/api/admin/login?user=admin&password=admin',
        path: '/api/admin/login?user=admin&password=admin',
      })
      const selector: Selector = {
        type: 'regex',
        from: 'url',
        regex: 'user=(.*?)&password',
      }
      const result = replaceRegex(selector, request, '${correl_0}')
      expect(result?.url).toBe(
        'https://quickpizza.grafana.com/api/admin/login?user=${correl_0}&password=admin'
      )
      expect(result?.path).toBe(
        '/api/admin/login?user=${correl_0}&password=admin'
      )
    })

    it('should not replace anything if regex not matched', () => {
      const request = createRequest({ content: '<div>hello</div>' })
      const selector: Selector = {
        type: 'regex',
        from: 'body',
        regex: '<span>(.*?)</span>',
      }
      const result = replaceRegex(selector, request, '${correl_0}')
      expect(result).toBe(request)
    })

    it('should replace only the first captured group when captured value appears multiple times', () => {
      const selector: Selector = {
        type: 'regex',
        from: 'body',
        regex: 'admin_(admin)_suffix',
      }
      const request = createRequest({ content: 'admin_admin_suffix' })
      const result = replaceRegex(selector, request, '${correl_0}')?.content
      expect(result).toBe('admin_${correl_0}_suffix')
    })

    it('should replace only the first capture group when there are multiple capture groups', () => {
      const selector: Selector = {
        type: 'regex',
        from: 'body',
        regex: '(admin)_(user)_suffix',
      }
      const request = createRequest({ content: 'admin_user_suffix' })
      const result = replaceRegex(selector, request, '${correl_0}')?.content
      // Only the first capture group should be replaced
      expect(result).toBe('${correl_0}_user_suffix')
    })

    it('should replace entire match when regex has no capture groups', () => {
      const selector: Selector = {
        type: 'regex',
        from: 'body',
        regex: 'admin_user',
      }
      const request = createRequest({ content: 'prefix_admin_user_suffix' })
      const result = replaceRegex(selector, request, '${correl_0}')?.content
      expect(result).toBe('prefix_${correl_0}_suffix')
    })

    it('should handle empty capture group', () => {
      const selector: Selector = {
        type: 'regex',
        from: 'body',
        regex: 'admin_()_suffix',
      }
      const request = createRequest({ content: 'admin__suffix' })
      const result = replaceRegex(selector, request, '${correl_0}')?.content
      expect(result).toBe('admin_${correl_0}_suffix')
    })

    it('should handle unicode characters in captured group', () => {
      const selector: Selector = {
        type: 'regex',
        from: 'body',
        regex: 'user_(.*?)_end',
      }
      const request = createRequest({ content: 'user_José_end' })
      const result = replaceRegex(selector, request, '${correl_0}')?.content
      expect(result).toBe('user_${correl_0}_end')
    })

    it('should only replace first occurrence when pattern appears multiple times', () => {
      const selector: Selector = {
        type: 'regex',
        from: 'body',
        regex: 'test_(.*?)_end',
      }
      const request = createRequest({
        content: 'test_first_end and test_second_end',
      })
      const result = replaceRegex(selector, request, '${correl_0}')?.content
      // Only first match should be replaced
      expect(result).toBe('test_${correl_0}_end and test_second_end')
    })
  })

  describe('Extractor', () => {
    it('should extract content using regex', () => {
      expect(matchRegex('<div>cat</div>', '<div>(.*?)</div>')).toBe('cat')
      expect(matchRegex('jumpinginthelake', 'ing(.*?)the')).toBe('in')
      expect(matchRegex('hello', '<a>(.*?)</a>')).toBeUndefined()
      // matches only the first occurrence
      expect(
        matchRegex('<div>cat</div><div>bob</div>', '<div>(.*?)</div>')
      ).toBe('cat')
    })
  })
})
