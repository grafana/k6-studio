import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { GroupedProxyData } from '@/types'
import { TestRule } from '@/types/rules'

import {
  createRequestFiltersSlice,
  RequestFilterState,
} from './slices/requestFilters'

interface GeneratorState extends RequestFilterState {
  recording: GroupedProxyData
  rules: TestRule[]

  setRecording: (recording: GroupedProxyData) => void
  resetRecording: () => void
}

export const useGeneratorStore = create<GeneratorState>()(
  immer((set, get, store) => ({
    ...createRequestFiltersSlice(set, get, store),
    recording: {},
    rules: [
      {
        type: 'customCode',
        filter: { path: '' },
        snippet: 'console.log("Hello, world!")',
        placement: 'before',
      },
    ],

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
