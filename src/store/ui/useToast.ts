import { useCallback } from 'react'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { AddToastPayload, Toast } from '@/types/toast'

interface State {
  toasts: Toast[]
  providerResetKey: number
}

interface Actions {
  add: (toast: Omit<Toast, 'id' | 'open'>) => void
  dismiss: (id: string) => void
  remove: (id: string) => void
}

export const useToastStore = create<State & Actions>()(
  immer((set) => ({
    toasts: [],
    providerResetKey: 0,

    add: (toast) =>
      set((state) => {
        if (!state.toasts.some((currentToast) => currentToast.open)) {
          state.toasts = []
          state.providerResetKey += 1
        }

        state.toasts.push({
          ...toast,
          id: self.crypto.randomUUID(),
          open: true,
        })
      }),

    dismiss: (id) =>
      set((state) => {
        const toast = state.toasts.find(
          (currentToast) => currentToast.id === id
        )

        if (toast) {
          toast.open = false
        }
      }),

    remove: (id) =>
      set((state) => {
        if (!state.toasts.some((toast) => toast.id === id)) {
          return
        }

        state.toasts = state.toasts.filter((toast) => toast.id !== id)
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
