import { TestRule } from '@/types/rules'
import { ImmerStateCreator } from '@/utils/typescript'

interface State {
  rules: TestRule[]
  selectedRuleId: string | null
}

interface Actions {
  createRule: (type: TestRule['type']) => void
  updateRule: (rule: TestRule) => void
  cloneRule: (id: string) => void
  deleteRule: (id: string) => void
  selectRule: (id: string | null) => void
  swapRules: (idA: string, idB: string) => void
}

export type RulesSliceStore = State & Actions

export const createRulesSlice: ImmerStateCreator<RulesSliceStore> = (set) => ({
  rules: [],
  selectedRuleId: null,
  createRule: (type) =>
    set((state) => {
      const newRule = createEmptyRule(type)
      state.rules.push(newRule)
      state.selectedRuleId = newRule.id
    }),
  updateRule: (rule) =>
    set((state) => {
      const index = state.rules.findIndex((r) => r.id === rule.id)
      if (index !== -1) {
        state.rules[index] = rule
      }
    }),
  cloneRule: (id) =>
    set((state) => {
      const rule = state.rules.find((rule) => rule.id === id)
      if (rule) {
        state.rules.push({ ...rule, id: self.crypto.randomUUID() })
      }
    }),
  deleteRule: (id) =>
    set((state) => {
      state.rules = state.rules.filter((rule) => rule.id !== id)
      state.selectedRuleId = null
    }),
  selectRule: (id) =>
    set((state) => {
      state.selectedRuleId = id
    }),
  swapRules: (idA, idB) =>
    set((state) => {
      const indexA = state.rules.findIndex((rule) => rule.id === idA)
      const indexB = state.rules.findIndex((rule) => rule.id === idB)
      if (state.rules[indexA] && state.rules[indexB]) {
        const ruleA = state.rules[indexA]
        state.rules[indexA] = state.rules[indexB]
        state.rules[indexB] = ruleA
      }
    }),
})

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