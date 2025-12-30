import { describe, it, expect } from 'vitest'

import { Request } from '@/types'
import { Selector } from '@/types/rules'

import {
  getJsonObjectFromPath,
  matchBeginEnd,
  matchRegex,
  replaceRequestValues,
} from './shared'

describe('replaceRequestValues', () => {
  describe('Begin-end selector', () => {
    it('should replace content between two substrings in body', () => {
      const selector: Selector = {
        type: 'begin-end',
        from: 'body',
        begin: '<div>',
        end: '</div>',
      }
      const request = generateRequest('<div>hello</div>')
      const result = replaceRequestValues({
        request,
        selector,
        value: '${correl_0}',
      })?.content
      expect(result).toBe('<div>${correl_0}</div>')
    })

    it('should replace content between two substrings in headers', () => {
      const request = generateRequest('')
      const selector: Selector = {
        type: 'begin-end',
        from: 'headers',
        begin: 'application',
        end: 'json',
      }
      const result = replaceRequestValues({
        request,
        selector,
        value: '${correl_0}',
      })?.headers
      expect(result).toEqual([
        ['content-type', 'application${correl_0}json'],
        ['content-length', '1000'],
      ])
    })

    it('should replace content between two substrings in url', () => {
      const request = {
        ...generateRequest(''),
        url: 'https://quickpizza.grafana.com/api/admin/login?user=admin&password=admin',
        path: '/api/admin/login?user=admin&password=admin',
      }
      const selector: Selector = {
        type: 'begin-end',
        from: 'url',
        begin: 'user=',
        end: '&password',
      }
      const result = replaceRequestValues({
        request,
        selector,
        value: '${correl_0}',
      })
      expect(result?.url).toBe(
        'https://quickpizza.grafana.com/api/admin/login?user=${correl_0}&password=admin'
      )
      expect(result?.path).toBe(
        '/api/admin/login?user=${correl_0}&password=admin'
      )
    })

    it('should not replace anything if begin-end not found', () => {
      const request = generateRequest('<div>hello</div>')
      const selector: Selector = {
        type: 'begin-end',
        from: 'body',
        begin: '<span>',
        end: '</span>',
      }
      const result = replaceRequestValues({
        request,
        selector,
        value: '${correl_0}',
      })
      expect(result).toBeUndefined()
    })

    it('should replace only the content between begin-end when captured value appears multiple times', () => {
      const selector: Selector = {
        type: 'begin-end',
        from: 'body',
        begin: 'admin_',
        end: '_suffix',
      }
      const request = generateRequest('admin_admin_suffix')
      const result = replaceRequestValues({
        request,
        selector,
        value: '${correl_0}',
      })?.content
      expect(result).toBe('admin_${correl_0}_suffix')
    })

    it('should not replace anything if begin-end substrings are missing', () => {
      const request = generateRequest('hello world')
      const selector: Selector = {
        type: 'begin-end',
        from: 'body',
        begin: '<span>',
        end: '</span>',
      }
      const result = replaceRequestValues({
        request,
        selector,
        value: '${correl_0}',
      })
      expect(result).toBeUndefined()
    })

    it('should not replace anything if begin or end strings are empty', () => {
      const request = generateRequest('hello world')
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
      const resultBeginEmpty = replaceRequestValues({
        request,
        selector: selectorBeginEmpty,
        value: '${correl_0}',
      })
      const resultEndEmpty = replaceRequestValues({
        request,
        selector: selectorEndEmpty,
        value: '${correl_0}',
      })
      expect(resultBeginEmpty).toBeUndefined()
      expect(resultEndEmpty).toBeUndefined()
    })
  })

  describe('Regex selector', () => {
    it('should replace content using regex in body', () => {
      const selector: Selector = {
        type: 'regex',
        from: 'body',
        regex: '<div>(.*?)</div>',
      }
      const request = generateRequest('<div>hello</div>')
      const result = replaceRequestValues({
        request,
        selector,
        value: '${correl_0}',
      })?.content
      expect(result).toBe('<div>${correl_0}</div>')
    })

    it('should replace content using regex in headers', () => {
      const request = generateRequest('')
      const selector: Selector = {
        type: 'regex',
        from: 'headers',
        regex: 'application(.*?)json',
      }
      const result = replaceRequestValues({
        request,
        selector,
        value: '${correl_0}',
      })?.headers
      expect(result).toEqual([
        ['content-type', 'application${correl_0}json'],
        ['content-length', '1000'],
      ])
    })

    it('should replace content using regex in url', () => {
      const request = {
        ...generateRequest(''),
        url: 'https://quickpizza.grafana.com/api/admin/login?user=admin&password=admin',
        path: '/api/admin/login?user=admin&password=admin',
      }
      const selector: Selector = {
        type: 'regex',
        from: 'url',
        regex: 'user=(.*?)&password',
      }
      const result = replaceRequestValues({
        request,
        selector,
        value: '${correl_0}',
      })
      expect(result?.url).toBe(
        'https://quickpizza.grafana.com/api/admin/login?user=${correl_0}&password=admin'
      )
      expect(result?.path).toBe(
        '/api/admin/login?user=${correl_0}&password=admin'
      )
    })

    it('should not replace anything if regex not matched', () => {
      const request = generateRequest('<div>hello</div>')
      const selector: Selector = {
        type: 'regex',
        from: 'body',
        regex: '<span>(.*?)</span>',
      }
      const result = replaceRequestValues({
        request,
        selector,
        value: '${correl_0}',
      })
      expect(result).toBeUndefined()
    })

    it('should replace only the first captured group when captured value appears multiple times', () => {
      const selector: Selector = {
        type: 'regex',
        from: 'body',
        regex: 'admin_(admin)_suffix',
      }
      const request = generateRequest('admin_admin_suffix')
      const result = replaceRequestValues({
        request,
        selector,
        value: '${correl_0}',
      })?.content
      expect(result).toBe('admin_${correl_0}_suffix')
    })

    it('should replace only the first capture group when there are multiple capture groups', () => {
      const selector: Selector = {
        type: 'regex',
        from: 'body',
        regex: '(admin)_(user)_suffix',
      }
      const request = generateRequest('admin_user_suffix')
      const result = replaceRequestValues({
        request,
        selector,
        value: '${correl_0}',
      })?.content
      // Only the first capture group should be replaced
      expect(result).toBe('${correl_0}_user_suffix')
    })

    it('should replace entire match when regex has no capture groups', () => {
      const selector: Selector = {
        type: 'regex',
        from: 'body',
        regex: 'admin_user',
      }
      const request = generateRequest('prefix_admin_user_suffix')
      const result = replaceRequestValues({
        request,
        selector,
        value: '${correl_0}',
      })?.content
      expect(result).toBe('prefix_${correl_0}_suffix')
    })

    it('should handle empty capture group', () => {
      const selector: Selector = {
        type: 'regex',
        from: 'body',
        regex: 'admin_()_suffix',
      }
      const request = generateRequest('admin__suffix')
      const result = replaceRequestValues({
        request,
        selector,
        value: '${correl_0}',
      })?.content
      expect(result).toBe('admin_${correl_0}_suffix')
    })

    it('should handle unicode characters in captured group', () => {
      const selector: Selector = {
        type: 'regex',
        from: 'body',
        regex: 'user_(.*?)_end',
      }
      const request = generateRequest('user_José_end')
      const result = replaceRequestValues({
        request,
        selector,
        value: '${correl_0}',
      })?.content
      expect(result).toBe('user_${correl_0}_end')
    })

    it('should only replace first occurrence when pattern appears multiple times', () => {
      const selector: Selector = {
        type: 'regex',
        from: 'body',
        regex: 'test_(.*?)_end',
      }
      const request = generateRequest('test_first_end and test_second_end')
      const result = replaceRequestValues({
        request,
        selector,
        value: '${correl_0}',
      })?.content
      // Only first match should be replaced
      expect(result).toBe('test_${correl_0}_end and test_second_end')
    })
  })

  describe('JSON selector', () => {
    it('should replace json value from path in body', () => {
      const selector: Selector = {
        type: 'json',
        from: 'body',
        path: 'hello',
      }
      const request = generateRequest('{"hello":"world"}')
      const result = replaceRequestValues({
        request,
        selector,
        value: '${correl_0}',
      })?.content
      expect(result).toBe('{"hello":"${correl_0}"}')
    })

    it('should not replace anything if json path not found', () => {
      const request = generateRequest('{"hello":"world"}')
      const selector: Selector = {
        type: 'json',
        from: 'body',
        path: 'notfound',
      }
      const result = replaceRequestValues({
        request,
        selector,
        value: '${correl_0}',
      })
      expect(result).toBeUndefined()
    })
  })

  describe('Header name selector', () => {
    it('should replace header value by name', () => {
      const request = generateRequest('')
      const selector: Selector = {
        type: 'header-name',
        from: 'headers',
        name: 'Content-Type',
      }
      const result = replaceRequestValues({
        request,
        selector,
        value: 'TEST_VALUE',
      })?.headers
      expect(result).toEqual([
        ['content-type', 'TEST_VALUE'],
        ['content-length', '1000'],
      ])
    })

    it('should not replace anything if header name not found', () => {
      const request = generateRequest('')
      const selector: Selector = {
        type: 'header-name',
        from: 'headers',
        name: 'not-existing',
      }
      const result = replaceRequestValues({
        request,
        selector,
        value: 'TEST_VALUE',
      })
      expect(result).toBeUndefined()
    })
  })

  describe('Text value selector', () => {
    it('should replace all occurrences of text in body', () => {
      const request = generateRequest('<div>hello</div>')
      const selector: Selector = {
        type: 'text',
        value: 'hello',
        from: 'body',
      }
      const result = replaceRequestValues({
        request,
        selector,
        value: '${correl_0}',
      })?.content
      expect(result).toBe('<div>${correl_0}</div>')
    })

    it('should replace all occurrences of text in headers', () => {
      const request = generateRequest('')
      const selector: Selector = {
        type: 'text',
        value: 'application',
        from: 'headers',
      }
      const result = replaceRequestValues({
        request,
        selector,
        value: '${correl_0}',
      })?.headers
      expect(result).toEqual([
        ['content-type', '${correl_0}/json'],
        ['content-length', '1000'],
      ])
    })

    it('should replace all occurrences of text in url', () => {
      const request = {
        ...generateRequest(''),
        url: 'https://quickpizza.grafana.com/',
        path: '/',
      }
      const selector: Selector = {
        type: 'text',
        value: 'quickpizza',
        from: 'url',
      }
      const result = replaceRequestValues({
        request,
        selector,
        value: '${correl_0}',
      })
      expect(result?.url).toBe('https://${correl_0}.grafana.com/')
      expect(result?.path).toBe('/')
    })
  })

  describe('Extraction functions', () => {
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

    it('should extract content using regex', () => {
      expect(matchRegex('<div>cat</div>', '<div>(.*?)</div>')).toBe('cat')
      expect(matchRegex('jumpinginthelake', 'ing(.*?)the')).toBe('in')
      expect(matchRegex('hello', '<a>(.*?)</a>')).toBeUndefined()
      // matches only the first occurrence
      expect(
        matchRegex('<div>cat</div><div>bob</div>', '<div>(.*?)</div>')
      ).toBe('cat')
    })

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

function generateRequest(content: string | null): Request {
  return {
    method: 'POST',
    url: 'http://test.k6.io/api/v1/foo',
    headers: [
      ['content-type', 'application/json'],
      ['content-length', '1000'],
    ],
    cookies: [['security', 'none']],
    query: [],
    scheme: 'http',
    host: 'localhost:3000',
    content,
    path: '/api/v1/foo',
    timestampStart: 0,
    timestampEnd: 0,
    contentLength: 0,
    httpVersion: '1.1',
  }
}
