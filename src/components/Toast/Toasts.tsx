import { useToast, useToastStore } from '@/store/ui/useToast'
import * as RadixToast from '@radix-ui/react-toast'
import { Toast } from './Toast'
import { ToastViewport } from './Toast.styles'
import { Button } from '@radix-ui/themes'

export function Toasts() {
  const toasts = useToastStore((state) => state.toasts)
  const addToast = useToast()

  return (
    <RadixToast.Provider swipeDirection="right">
      <button
        onClick={() => {
          addToast({
            title: 'Hello world!',
            action: <Button>undo</Button>,
            status: 'success',
          })
        }}
      >
        with action
      </button>

      <button
        onClick={() => {
          addToast({
            title: 'Just title',
            status: 'error',
          })
        }}
      >
        just title
      </button>
      <button
        onClick={() => {
          addToast({
            title: 'Hello world!',
            description:
              'just a simple description that could be a potentially long text',
          })
        }}
      >
        with description
      </button>

      <button
        onClick={() => {
          addToast({
            title: 'Hello world!',
            description:
              'just a simple description that could be a potentially long text',
          })
        }}
      >
        with description
      </button>
      <button
        onClick={() => {
          addToast({
            title: 'Hello world!',
            description:
              'just a simple description that could be a potentially long text',
            action: <Button>undo</Button>,
            status: 'success',
          })
        }}
      >
        with description and action
      </button>
      {toasts.map((toast) => (
        <Toast toast={toast} key={toast.id} />
      ))}
      <ToastViewport />
    </RadixToast.Provider>
  )
}
