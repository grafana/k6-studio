import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { GroupedProxyData } from '@/types'
import { TestRule } from '@/types/rules'

interface GeneratorState {
  recording: GroupedProxyData
  rules: TestRule[]
  requestFilters: string[]
  setRecording: (recording: GroupedProxyData) => void
  addRequestFilter: (filter: string) => void
}

export const useGeneratorStore = create<GeneratorState>()(
  immer((set) => ({
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
  }))
)
