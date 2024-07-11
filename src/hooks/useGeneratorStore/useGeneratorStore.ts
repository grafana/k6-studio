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
        id: '0',
        type: 'customCode',
        filter: { path: '' },
        snippet: 'console.log("Hello, world!")',
        placement: 'before',
      },
      {
        type: 'correlation',
        id: '1',
        extractor: {
          filter: { path: '' },
          selector: {
            type: 'begin-end',
            from: 'body',
            begin: '<meta name=Copyright content="',
            end: '">',
          },
        },
      },
      {
        type: 'correlation',
        id: '3',
        extractor: {
          filter: { path: '' },
          selector: {
            type: 'regex',
            from: 'url',
            regex: 'grafana.com/(.*?)/',
          },
        },
      },
      {
        type: 'correlation',
        id: '2',
        extractor: {
          filter: { path: '' },
          selector: {
            type: 'begin-end',
            from: 'headers',
            begin: 'charset=',
            end: '-8',
          },
        },
      },
      {
        type: 'correlation',
        id: '4',
        extractor: {
          filter: { path: '' },
          selector: {
            type: 'json',
            from: 'body',
            path: '[0].title',
          },
        },
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
    deleteRule: (id: string) =>
      set((state) => {
        state.rules = state.rules.filter((rule) => rule.id !== id)
      }),
  }))
)
