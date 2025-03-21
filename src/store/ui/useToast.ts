import { useCallback } from 'react'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { AddToastPayload, Toast } from '@/types/toast'

interface State {
  toasts: Toast[]
}

interface Actions {
  add: (toast: Omit<Toast, 'id'>) => void
}

export const useToastStore = create<State & Actions>()(
  immer((set) => ({
    toasts: [],

    add: (toast) =>
      set((state) => {
        state.toasts.push({
          ...toast,
          id: self.crypto.randomUUID(),
        })
      }),
  }))
)

export function useToast() {
  const add = useToastStore((state) => state.add)

  const showToast = useCallback(
    ({ status = 'default', ...props }: AddToastPayload) => {
      add({
        status,
        ...props,
      })
    },
    [add]
  )

  return showToast
}
