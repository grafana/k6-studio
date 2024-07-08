import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { GroupedProxyData } from '@/types'
import { TestRule } from '@/types/rules'

interface GeneratorState {
  recording: GroupedProxyData
  rules: TestRule[]
  requestFilters: string[]
  setRecording: (recording: GroupedProxyData) => void
  resetRecording: () => void
  addRequestFilter: (filter: string) => void
}

export const useGeneratorStore = create<GeneratorState>()(
  immer((set) => ({
    recording: {},
    rules: [
      // {
      //   type: 'customCode',
      //   filter: { path: '' },
      //   snippet: 'console.log("Hello, world!")',
      //   placement: 'before',
      // },
      {
        type: 'correlation',
        name: 'correlation_1',
        id: '1',
        extractor: {
          filter: { path: '' },
          selector: {
            type: 'begin-end',
            from: 'body',
            // begin: '"mimeType": "',
            // end: '",'
            // begin: '<stop offset="0.951255" stop-color="',
            // end: '" stop-opacity="0"/>'
            begin: '<meta name=Copyright content="',
            end: '">'
          }
        }
      },
      {
        type: 'correlation',
        name: 'correlation_3',
        id: '3',
        extractor: {
          filter: { path: '' },
          selector: {
            type: 'regex',
            from: 'url',
            regex: 'grafana.com/(.*?)/'
          }
        }
      },
      // {
      //   type: 'correlation',
      //   id: '2',
      //   extractor: {
      //     from: 'headers',
      //     filter: { path: '' },
      //     selector: {
      //       type: 'begin-end',
      //       from: 'headers',
      //       begin: 'charset=',
      //       end: '-8'
      //     }
      //   }
      // },
      {
        type: 'correlation',
        name: 'correlation_4',
        id: '4',
        extractor: {
          filter: { path: '' },
          selector: {
            type: 'json',
            path: '[0].title'
          }
        }
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
