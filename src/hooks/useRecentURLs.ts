import { useLocalStorage } from 'react-use'

const LOCAL_STORAGE_KEY = 'recentURLs'
const MAX_RECENT_URLS = 3

export function useRecentURLs() {
  const [recentURLs = [], setRecentURLs] = useLocalStorage<string[]>(
    LOCAL_STORAGE_KEY,
    []
  )

  const addURL = (url: string) => {
    if (!url || recentURLs.includes(url)) {
      return
    }

    const updatedURLs = [url, ...recentURLs].slice(0, MAX_RECENT_URLS)
    setRecentURLs(updatedURLs)
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
