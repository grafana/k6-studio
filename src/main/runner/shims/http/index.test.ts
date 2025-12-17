import execution from 'k6/execution'
import nativeHttp from 'k6/http'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('HTTP Shim', () => {
  let http: typeof import('k6/http').default

  beforeEach(async () => {
    vi.clearAllMocks()

    // Re-import the shim to get fresh instance
    const httpModule = await import('./index')
    http = httpModule.default
  })

  describe('get method', () => {
    it('should instrument params when provided', () => {
      const url = 'http://test.k6.io'
      const params = { headers: { 'User-Agent': 'test' } }

      http.get(url, params)

      expect(nativeHttp.get).toHaveBeenCalledWith(url, {
        headers: {
          'User-Agent': 'test',
          'X-k6-group': 'my-group',
        },
      })
    })

    it('should create params object when not provided', () => {
      const url = 'http://test.k6.io'

      http.get(url)

      expect(nativeHttp.get).toHaveBeenCalledWith(url, {
        headers: {
          'X-k6-group': 'my-group',
        },
      })
    })

    it('should handle null params', () => {
      const url = 'http://test.k6.io'

      http.get(url, null)

      expect(nativeHttp.get).toHaveBeenCalledWith(url, {
        headers: {
          'X-k6-group': 'my-group',
        },
      })
    })
  })

  describe('post method', () => {
    it('should instrument params with body', () => {
      const url = 'http://test.k6.io'
      const body = JSON.stringify({ data: 'test' })
      const params = { headers: { 'Content-Type': 'application/json' } }

      http.post(url, body, params)

      expect(nativeHttp.post).toHaveBeenCalledWith(url, body, {
        headers: {
          'Content-Type': 'application/json',
          'X-k6-group': 'my-group',
        },
      })
    })

    it('should handle missing body and params', () => {
      const url = 'http://test.k6.io'

      http.post(url)

      expect(nativeHttp.post).toHaveBeenCalledWith(url, undefined, {
        headers: {
          'X-k6-group': 'my-group',
        },
      })
    })
  })

  describe('request method', () => {
    it('should instrument params with all arguments', () => {
      const method = 'GET'
      const url = 'http://test.k6.io'
      const body = null
      const params = { timeout: '30s' }

      http.request(method, url, body, params)

      expect(nativeHttp.request).toHaveBeenCalledWith(method, url, body, {
        timeout: '30s',
        headers: {
          'X-k6-group': 'my-group',
        },
      })
    })

    it('should handle missing params', () => {
      const method = 'GET'
      const url = 'http://test.k6.io'

      http.request(method, url)

      expect(nativeHttp.request).toHaveBeenCalledWith(method, url, undefined, {
        headers: {
          'X-k6-group': 'my-group',
        },
      })
    })
  })

  describe('head method', () => {
    it('should instrument params', () => {
      const url = 'http://test.k6.io'
      const params = { tags: { name: 'test' } }

      http.head(url, params)

      expect(nativeHttp.head).toHaveBeenCalledWith(url, {
        tags: { name: 'test' },
        headers: {
          'X-k6-group': 'my-group',
        },
      })
    })
  })

  describe('put method', () => {
    it('should instrument params', () => {
      const url = 'http://test.k6.io'
      const body = { data: 'test' }

      http.put(url, body)

      expect(nativeHttp.put).toHaveBeenCalledWith(url, body, {
        headers: {
          'X-k6-group': 'my-group',
        },
      })
    })
  })

  describe('patch method', () => {
    it('should instrument params', () => {
      const url = 'http://test.k6.io'
      const body = { data: 'test' }

      http.patch(url, body)

      expect(nativeHttp.patch).toHaveBeenCalledWith(url, body, {
        headers: {
          'X-k6-group': 'my-group',
        },
      })
    })
  })

  describe('del method', () => {
    it('should instrument params', () => {
      const url = 'http://test.k6.io'

      http.del(url)

      expect(nativeHttp.del).toHaveBeenCalledWith(url, undefined, {
        headers: {
          'X-k6-group': 'my-group',
        },
      })
    })
  })

  describe('options method', () => {
    it('should instrument params', () => {
      const url = 'http://test.k6.io'

      http.options(url)

      expect(nativeHttp.options).toHaveBeenCalledWith(url, undefined, {
        headers: {
          'X-k6-group': 'my-group',
        },
      })
    })
  })

  describe('group header formatting', () => {
    it('should trim and remove :: prefix from group', () => {
      execution.vu.metrics.tags.group = ' ::my-nested-group  '

      http.get('http://test.k6.io')

      expect(nativeHttp.get).toHaveBeenCalledWith('http://test.k6.io', {
        headers: {
          'X-k6-group': 'my-nested-group',
        },
      })
    })

    it('should handle empty group', () => {
      execution.vu.metrics.tags.group = ''

      http.get('http://test.k6.io')

      expect(nativeHttp.get).toHaveBeenCalledWith('http://test.k6.io', {
        headers: {
          'X-k6-group': '',
        },
      })
    })
  })
})
