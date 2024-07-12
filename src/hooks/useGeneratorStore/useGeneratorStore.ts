import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { GroupedProxyData } from '@/types'
import { createLoadProfileSlice } from './slices/loadProfile'
import { GeneratorState } from './types'
import { TestRule } from '@/types/rules'

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
    selectedRuleId: null,
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
        state.selectedRuleId = null
      }),
    selectRule: (id: string) =>
      set((state) => {
        state.selectedRuleId = id
      }),
    updateRule: (rule: TestRule) =>
      set((state) => {
        const index = state.rules.findIndex((r) => r.id === rule.id)
        if (index !== -1) {
          state.rules[index] = rule
        }
      }),
    createRule: (type: TestRule['type']) =>
      set((state) => {
        const newRule = createEmptyRule(type)
        state.rules.push(newRule)
        state.selectedRuleId = newRule.id
      }),
    cloneRule: (id: string) =>
      set((state) => {
        const rule = state.rules.find((rule) => rule.id === id)
        if (rule) {
          state.rules.push({ ...rule, id: self.crypto.randomUUID() })
        }
      }),
  }))
)

function createEmptyRule(type: TestRule['type']): TestRule {
  switch (type) {
    case 'correlation':
      return {
        type: 'correlation',
        id: self.crypto.randomUUID(),
        extractor: {
          filter: { path: '' },
          selector: {
            type: 'begin-end',
            from: 'body',
            begin: '',
            end: '',
          },
        },
      }
    case 'customCode':
      return {
        type: 'customCode',
        id: self.crypto.randomUUID(),
        filter: { path: '' },
        snippet: '',
        placement: 'before',
      }
    case 'parameterization':
      return {
        type: 'parameterization',
        id: self.crypto.randomUUID(),
        filter: { path: '' },
        selector: {
          type: 'begin-end',
          from: 'body',
          begin: '',
          end: '',
        },
        value: { type: 'variable', variableName: '' },
      }
    case 'verification':
      return {
        type: 'verification',
        id: self.crypto.randomUUID(),
        filter: { path: '' },
        selector: {
          type: 'begin-end',
          from: 'body',
          begin: '',
          end: '',
        },
        value: {
          type: 'recordedValue',
        },
      }
  }
}
