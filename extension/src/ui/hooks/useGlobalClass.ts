import { useEffect } from 'react'

export function useGlobalClass(name: string) {
  useEffect(() => {
    document.body.classList.add('ksix-studio-inspecting')

    return () => {
      document.body.classList.remove('ksix-studio-inspecting')
    }
  }, [name])
}
