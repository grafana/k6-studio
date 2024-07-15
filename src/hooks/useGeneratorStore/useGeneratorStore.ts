import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { ProxyData } from '@/types'
import { createLoadProfileSlice } from './slices/loadProfile'
import { createVariablesSlice } from './slices/variables'
import { createThinkTimeSlice } from './slices/thinkTime'
import { GeneratorState } from './types'
import { createRulesSlice } from './slices/rules'

export const useGeneratorStore = create<GeneratorState>()(
  immer((set, get, store) => ({
    ...createLoadProfileSlice(set, get, store),
    ...createRulesSlice(set, get, store),
    ...createVariablesSlice(set, get, store),
    ...createThinkTimeSlice(set, get, store),
    requests: [],
    filteredRequests: [],
    setRecording: (requests: ProxyData[]) =>
      set((state) => {
        state.requests = requests
        state.allowList = []
        state.showAllowListDialog = true
      }),
    resetRecording: () =>
      set((state) => {
        state.requests = []
        state.filteredRequests = []
        state.allowList = []
      }),

    allowList: [],
    setAllowList: (value) =>
      set((state) => {
        state.allowList = value
      }),

    setFilteredRequests: (requests) =>
      set((state) => {
        state.filteredRequests = requests
      }),

    showAllowListDialog: false,
    setShowAllowListDialog: (value) =>
      set((state) => {
        state.showAllowListDialog = value
      }),
  }))
)
