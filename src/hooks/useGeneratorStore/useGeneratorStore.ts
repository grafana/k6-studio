import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { GroupedProxyData } from '@/types'
import { createLoadProfileSlice } from './slices/loadProfile'
import { GeneratorState } from './types'

export const useGeneratorStore = create<GeneratorState>()(
  immer((set, get, store) => ({
    ...createLoadProfileSlice(set, get, store),
    recording: {},
    rules: [
      {
        type: 'customCode',
        filter: { path: '' },
        snippet: 'console.log("Hello, world!")',
        placement: 'before',
      },
    ],
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
