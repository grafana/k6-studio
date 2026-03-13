import { useLocalStorage } from 'react-use'

const LOCAL_STORAGE_KEY = 'recentURLs'
const MAX_RECENT_URLS = 3

/**
 * Normalizes a URL by only lowercasing the scheme and host (per RFC 3986).
 * Path, query, and fragment are case-sensitive and must be preserved.
 */
function normalizeURL(url: string): string {
  const trimmed = url.trim()

  if (!trimmed) {
    return ''
  }

  try {
    // Per the specification, the URL parser will lowercase the protocol and hostname.
    return new URL(trimmed).toString()
  } catch {
    return trimmed
  }
}

export function useRecentURLs() {
  const [recentURLs = [], setRecentURLs] = useLocalStorage<string[]>(
    LOCAL_STORAGE_KEY,
    []
  )

  const addURL = (url: string) => {
    const normalizedURL = normalizeURL(url)

    if (!normalizedURL) {
      return
    }

    setRecentURLs((prev = []) =>
      [normalizedURL, ...prev.filter((u) => u !== normalizedURL)].slice(
        0,
        MAX_RECENT_URLS
      )
    )
  }

  const removeURL = (url: string) => {
    const updatedURLs = recentURLs.filter((u) => u !== url)
    setRecentURLs(updatedURLs)
  }

  return {
    recentURLs,
    addURL,
    removeURL,
  }
}
