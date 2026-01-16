import * as RadixToast from '@radix-ui/react-toast'
import { useEffect } from 'react'

import { useToast, useToastStore } from '@/store/ui/useToast'

import { Toast } from './Toast'
import { ToastViewport } from './Toast.styles'

export function Toasts() {
  const toasts = useToastStore((state) => state.toasts)
  const addToast = useToast()

  useEffect(() => {
    return window.studio.ui.onToast((data) => {
      addToast(data)
    })
  }, [addToast])

  return (
    <>
      <RadixToast.Provider swipeDirection="right">
        {toasts.map((toast) => (
          <Toast toast={toast} key={toast.id} />
        ))}
        <ToastViewport />
      </RadixToast.Provider>
    </>
  )
}
