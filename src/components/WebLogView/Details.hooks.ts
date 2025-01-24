import { create } from 'zustand'

interface DetailsTabStore {
  tab: string
  setTab: (tab: string) => void
}

function createDetailsTabStore() {
  return create<DetailsTabStore>((set) => ({
    tab: 'headers',
    setTab: (tab) => set({ tab }),
  }))
}

export const useRequestDetailsTab = createDetailsTabStore()
export const useResponseDetailsTab = createDetailsTabStore()

interface ContentMatchStore {
  searchString?: string
  index: number
  goToMatch: ({
    searchString,
    index,
  }: {
    searchString?: string
    index?: number
  }) => void
  reset: () => void
}

function createStore() {
  return create<ContentMatchStore>((set) => ({
    searchString: undefined,
    index: 0,
    goToMatch: ({ searchString, index }) =>
      set({ searchString, index: index ?? 0 }),
    reset: () => set({ searchString: undefined, index: 0 }),
  }))
}

export const useGoToContentMatch = createStore()
export const useGoToPayloadMatch = createStore()
