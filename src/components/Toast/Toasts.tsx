import { useToastStore } from '@/store/ui/useToast'
import * as RadixToast from '@radix-ui/react-toast'
import { Toast } from './Toast'
import { ToastViewport } from './Toast.styles'

export function Toasts() {
  const toasts = useToastStore((state) => state.toasts)

  return (
    <RadixToast.Provider swipeDirection="right">
      {toasts.map((toast) => (
        <Toast toast={toast} key={toast.id} />
      ))}
      <ToastViewport />
    </RadixToast.Provider>
  )
}
