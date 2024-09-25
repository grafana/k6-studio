import { useEffect } from 'react'

export function useCloseSplashScreen() {
  useEffect(() => {
    window.studio.app.closeSplashscreen()
  }, [])
}
