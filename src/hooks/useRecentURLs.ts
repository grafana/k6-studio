import { z } from 'zod'

import { useSyncedLocalStorage } from './useSyncedLocalStorage'

const LOCAL_STORAGE_KEY = 'recentURLs'
const MAX_RECENT_URLS = 10

function hasScheme(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

function areSameURL(a: string, b: string): boolean {
  if (!hasScheme(a) && !hasScheme(b)) {
    return areSameURL('http://' + a, 'http://' + b)
  }

  try {
    const urlA = new URL(a)
    const urlB = new URL(b)
    // scheme and host are case-insensitive per RFC 3986
    return urlA.href === urlB.href
  } catch {
    // Fallback for invalid URLs: exact match
    return a === b
  }
}

interface UseRecentURLsOptions {
  limit?: number
}

const RecentURLsStorageSchema = z.array(z.string())

export function useRecentURLs({ limit }: UseRecentURLsOptions = {}) {
  const [storedURLs, setRecentURLs] = useSyncedLocalStorage<string[]>(
    LOCAL_STORAGE_KEY,
    RecentURLsStorageSchema,
    []
  )

  const recentURLs =
    limit !== undefined ? storedURLs.slice(0, limit) : storedURLs

  const addURL = (url: string) => {
    const trimmedURL = url.trim()

    if (!trimmedURL) {
      return
    }

    setRecentURLs((prev) => {
      const newUrls = prev.filter(
        (existingUrl) => !areSameURL(existingUrl, trimmedURL)
      )

      return [trimmedURL, ...newUrls].slice(0, MAX_RECENT_URLS)
    })
  }

  const removeURL = (url: string) => {
    setRecentURLs((prev) =>
      prev.filter((existingUrl) => !areSameURL(existingUrl, url))
    )
  }

  return { recentURLs, addURL, removeURL }
}
