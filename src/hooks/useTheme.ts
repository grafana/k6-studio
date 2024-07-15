import { useEffect, useState } from 'react'

export function useTheme() {
  const query = '(prefers-color-scheme: dark)'

  const [isDark, setIsDark] = useState(window.matchMedia(query).matches)

  useEffect(() => {
    const matchMedia = window.matchMedia(query)

    const handleThemeChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches)
    }

    matchMedia.addEventListener('change', handleThemeChange)

    return () => {
      matchMedia.removeEventListener('change', handleThemeChange)
    }
  }, [])

  return isDark ? 'dark' : 'light'
}
