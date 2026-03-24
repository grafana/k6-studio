import { useLocalStorage } from 'react-use'

const LOCAL_STORAGE_KEY = 'recentURLs'
const MAX_RECENT_URLS = 3

function areSameURL(a: string, b: string): boolean {
  try {
    const urlA = new URL(a)
    const urlB = new URL(b)
    // scheme and host are case-insensitive per RFC 3986
    return (
      urlA.protocol === urlB.protocol &&
      urlA.host.toLowerCase() === urlB.host.toLowerCase() &&
      urlA.pathname === urlB.pathname &&
      urlA.search === urlB.search &&
      urlA.hash === urlB.hash
    )
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
    if (!trimmedURL) return

    setRecentURLs((prev = []) =>
      [trimmedURL, ...prev.filter((u) => !areSameURL(u, trimmedURL))].slice(
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
