import { useEffect } from 'react'

const defaultTitle = 'k6 Studio (public preview)'

export function useSetWindowTitle(title: string) {
  useEffect(() => {
    document.title = `${defaultTitle} - ${title}`

    return () => {
      document.title = defaultTitle
    }
  }, [title])
}
