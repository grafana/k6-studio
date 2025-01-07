import { create } from 'zustand'

interface Store {
  tab: string
  setTab: (tab: string) => void
}

export const useRequestDetailsTab = create<Store>((set) => ({
  tab: 'headers',
  setTab: (tab) => set({ tab }),
}))

export const useResponseDetailsTab = create<Store>((set) => ({
  tab: 'headers',
  setTab: (tab: string) => set({ tab }),
}))
