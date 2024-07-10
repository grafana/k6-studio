import { ImmerStateCreator } from '@/utils/typescript'

export interface RequestFilter {
  url: string
  allowed: boolean
}

export interface RequestFilterState {
  requestFilters: RequestFilter[]
  setRequestFilters: (filters: RequestFilter[]) => void
}

export const createRequestFiltersSlice: ImmerStateCreator<
  RequestFilterState
> = (set) => ({
  requestFilters: [],

  setRequestFilters: (filters: RequestFilter[]) =>
    set((state) => {
      state.requestFilters = filters
    }),
})
