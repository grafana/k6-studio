import { create } from 'zustand'

interface DetailsTabStore {
  tab: string
  setTab: (tab: string) => void
}

// TODO: remove duplication OR merge into single stores
export const useRequestDetailsTab = create<DetailsTabStore>((set) => ({
  tab: 'headers',
  setTab: (tab) => set({ tab }),
}))

export const useResponseDetailsTab = create<DetailsTabStore>((set) => ({
  tab: 'headers',
  setTab: (tab) => set({ tab }),
}))

// TODO: rename
interface Store {
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
  return create<Store>((set) => ({
    searchString: undefined,
    index: 0,
    goToMatch: ({ searchString, index }) =>
      set({ searchString, index: index ?? 0 }),
    reset: () => set({ searchString: undefined, index: 0 }),
  }))
}

export const useGoToContentMatch = createStore()
export const useGoToPayloadMatch = createStore()
