import { useEffect, useState } from 'react'

const defaultTitle = 'k6 studio'

export function useSetWindowTitle(initialTitle: string) {
  const [windowTitle, setWindowTitle] = useState(initialTitle)

  useEffect(() => {
    document.title = `${defaultTitle} - ${windowTitle}`

    return () => {
      document.title = defaultTitle
    }
  }, [windowTitle])

  return { windowTitle, setWindowTitle }
}
