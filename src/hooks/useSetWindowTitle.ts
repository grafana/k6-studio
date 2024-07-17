import { useEffect } from 'react'

const defaultTitle = 'k6 studio'

export function useSetWindowTitle(title: string) {
  useEffect(() => {
    document.title = `${defaultTitle} - ${title}`

    return () => {
      document.title = defaultTitle
    }
  }, [title])
}
