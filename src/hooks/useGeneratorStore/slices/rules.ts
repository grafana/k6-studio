import { TestRule } from '@/schemas/rules'
import { ImmerStateCreator } from '@/utils/typescript'
import { rules } from '../fixtures'

interface State {
  rules: TestRule[]
  selectedRuleId: string | null
}

interface Actions {
  createRule: (type: TestRule['type']) => void
  updateRule: (rule: TestRule) => void
  cloneRule: (id: string) => void
  deleteRule: (id: string) => void
  selectRule: (id: string) => void
}

export type RulesSliceStore = State & Actions

export const createRulesSlice: ImmerStateCreator<RulesSliceStore> = (set) => ({
  rules,
  selectedRuleId: null,
  createRule: (type: TestRule['type']) =>
    set((state) => {
      const newRule = createEmptyRule(type)
      state.rules.push(newRule)
      state.selectedRuleId = newRule.id
    }),
  updateRule: (rule: TestRule) =>
    set((state) => {
      const index = state.rules.findIndex((r) => r.id === rule.id)
      if (index !== -1) {
        state.rules[index] = rule
      }
    }),
  cloneRule: (id: string) =>
    set((state) => {
      const rule = state.rules.find((rule) => rule.id === id)
      if (rule) {
        state.rules.push({ ...rule, id: self.crypto.randomUUID() })
      }
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
