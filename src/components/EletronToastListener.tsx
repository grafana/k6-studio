import { useToast } from '@/store/ui/useToast'
import { useEffect } from 'react'

export function ElectronToastListener() {
  const addToast = useToast()

  useEffect(() => {
    return window.studio.ui.onToast((data) => {
      addToast(data)
    })
  }, [addToast])

  return null
}
