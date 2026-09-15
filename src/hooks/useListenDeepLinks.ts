import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function useListenDeepLinks() {
  const navigate = useNavigate()

  useEffect(() => {
    return window.studio.app.onDeepLink((path) => {
      void navigate(path)
    })
  }, [navigate])
}
