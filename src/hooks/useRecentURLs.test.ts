import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'

import { useRecentURLs } from './useRecentURLs'

const STORAGE_KEY = 'recentURLs'

function seedURLs(urls: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(urls))
}

describe('useRecentURLs', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('addURL', () => {
    it('preserves original URL casing', () => {
      const { result } = renderHook(() => useRecentURLs())

      act(() => {
        result.current.addURL(
          'https://example.com/CaseSensitive/Path?Key=Value'
        )
      })

      expect(result.current.recentURLs).toEqual([
        'https://example.com/CaseSensitive/Path?Key=Value',
      ])
    })

    it('trims whitespace', () => {
      const { result } = renderHook(() => useRecentURLs())

      act(() => {
        result.current.addURL('  https://example.com  ')
      })

      expect(result.current.recentURLs).toEqual(['https://example.com'])
    })

    it('ignores empty strings', () => {
      const { result } = renderHook(() => useRecentURLs())

      act(() => {
        result.current.addURL('')
      })

      expect(result.current.recentURLs).toEqual([])
    })

    it('ignores whitespace-only strings', () => {
      const { result } = renderHook(() => useRecentURLs())

      act(() => {
        result.current.addURL('   ')
      })

      expect(result.current.recentURLs).toEqual([])
    })

    it('deduplicates same URL', () => {
      seedURLs(['https://example.com/path'])
      const { result } = renderHook(() => useRecentURLs())

      act(() => {
        result.current.addURL('https://example.com/path')
      })

      expect(result.current.recentURLs).toEqual(['https://example.com/path'])
    })

    it('deduplicates URLs differing only in host case', () => {
      seedURLs(['https://EXAMPLE.COM/Path'])
      const { result } = renderHook(() => useRecentURLs())

      act(() => {
        result.current.addURL('https://example.com/Path')
      })

      expect(result.current.recentURLs).toEqual(['https://example.com/Path'])
    })

    it('does not deduplicate URLs with different path casing', () => {
      seedURLs(['https://example.com/path'])
      const { result } = renderHook(() => useRecentURLs())

      act(() => {
        result.current.addURL('https://example.com/Path')
      })

      expect(result.current.recentURLs).toEqual([
        'https://example.com/Path',
        'https://example.com/path',
      ])
    })

    it('does not deduplicate URLs with different query casing', () => {
      seedURLs(['https://example.com?Key=A'])
      const { result } = renderHook(() => useRecentURLs())

      act(() => {
        result.current.addURL('https://example.com?key=A')
      })

      expect(result.current.recentURLs).toEqual([
        'https://example.com?key=A',
        'https://example.com?Key=A',
      ])
    })

    it('limits to 10 recent URLs', () => {
      seedURLs(
        Array.from({ length: 10 }, (_, i) => `https://example.com/${10 - i}`)
      )
      const { result } = renderHook(() => useRecentURLs())

      act(() => {
        result.current.addURL('https://example.com/11')
      })

      expect(result.current.recentURLs).toEqual([
        'https://example.com/11',
        ...Array.from({ length: 9 }, (_, i) => `https://example.com/${10 - i}`),
      ])
    })

    it('caps the returned list when limit is provided', () => {
      seedURLs([
        'https://example.com/3',
        'https://example.com/2',
        'https://example.com/1',
      ])
      const { result } = renderHook(() => useRecentURLs({ limit: 2 }))

      expect(result.current.recentURLs).toEqual([
        'https://example.com/3',
        'https://example.com/2',
      ])
    })

    it('puts most recent URL first', () => {
      seedURLs(['https://example.com/a'])
      const { result } = renderHook(() => useRecentURLs())

      act(() => {
        result.current.addURL('https://example.com/b')
      })

      expect(result.current.recentURLs).toEqual([
        'https://example.com/b',
        'https://example.com/a',
      ])
    })
  })

  describe('removeURL', () => {
    it('removes a URL from the list', () => {
      seedURLs(['https://example.com'])
      const { result } = renderHook(() => useRecentURLs())

      act(() => {
        result.current.removeURL('https://example.com')
      })

      expect(result.current.recentURLs).toEqual([])
    })

    it('does not remove other URLs', () => {
      seedURLs(['https://example.com/a'])
      const { result } = renderHook(() => useRecentURLs())

      act(() => {
        result.current.removeURL('https://example.com/b')
      })

      expect(result.current.recentURLs).toEqual(['https://example.com/a'])
    })

    it('removes URL even with different host casing', () => {
      seedURLs(['https://EXAMPLE.COM/Path'])
      const { result } = renderHook(() => useRecentURLs())

      act(() => {
        result.current.removeURL('https://example.com/Path')
      })

      expect(result.current.recentURLs).toEqual([])
    })
  })
})
