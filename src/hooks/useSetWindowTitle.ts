import { useEffect } from 'react'

const defaultTitle = 'k6 Studio (experimental)'

export function useSetWindowTitle(title: string) {
  useEffect(() => {
    document.title = `${defaultTitle} - ${title}`

    return () => {
      document.title = defaultTitle
    }
  }, [title])
}
