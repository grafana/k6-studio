import { useLocalStorage } from 'react-use'

const LOCAL_STORAGE_KEY = 'recentURLs'
const MAX_RECENT_URLS = 3

function hasScheme(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://')
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

export function useRecentURLs() {
  const [recentURLs = [], setRecentURLs] = useLocalStorage<string[]>(
    LOCAL_STORAGE_KEY,
    []
  )

  const addURL = (url: string) => {
    const trimmedURL = url.trim()

    if (!trimmedURL) {
      return
    }

    const newUrls = recentURLs.filter(
      (existingUrl) => !areSameURL(existingUrl, trimmedURL)
    )

    setRecentURLs([trimmedURL, ...newUrls].slice(0, MAX_RECENT_URLS))
  }

  const removeURL = (url: string) => {
    setRecentURLs(
      recentURLs.filter((existingUrl) => !areSameURL(existingUrl, url))
    )
  }

  return {
    recentURLs,
    addURL,
    removeURL,
  }
}
