import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { GroupedProxyData } from '@/types'
import { createLoadProfileSlice } from './slices/loadProfile'
import { GeneratorState } from './types'
import { createRulesSlice } from './slices/rules'

export const useGeneratorStore = create<GeneratorState>()(
  immer((set, get, store) => ({
    ...createLoadProfileSlice(set, get, store),
    ...createRulesSlice(set, get, store),
    recording: {},
    requestFilters: [],
    addRequestFilter: (filter: string) =>
      set((state) => {
        state.requestFilters.push(filter)
      }),
    setRecording: (recording: GroupedProxyData) =>
      set((state) => {
        state.recording = recording
      }),
    resetRecording: () =>
      set((state) => {
        state.recording = {}
      }),
  }))
)
