import { TestRule } from '@/types/rules'
import { ImmerStateCreator } from '@/utils/typescript'

interface State {
  rules: TestRule[]
  selectedRuleId: string | null
  previewOriginalRequests: boolean
}

interface Actions {
  addRule: (rule: TestRule) => void
  updateRule: (rule: TestRule) => void
  cloneRule: (id: string) => void
  deleteRule: (id: string) => void
  toggleEnableRule: (id: string) => void
  swapRules: (idA: string, idB: string) => void
  setSelectedRuleId: (id: string | null) => void
  setPreviewOriginalRequests: (apply: boolean) => void
  setRules: (rules: TestRule[]) => void
}

export type RulesSliceStore = State & Actions

export const createRulesSlice: ImmerStateCreator<RulesSliceStore> = (set) => ({
  rules: [],
  selectedRuleId: null,
  previewOriginalRequests: false,
  addRule: (rule) =>
    set((state) => {
      state.rules.push(rule)
      state.selectedRuleId = rule.id
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
      if (state.selectedRuleId === id) {
        state.selectedRuleId = null
      }

      state.rules = state.rules.filter((rule) => rule.id !== id)
    }),
  toggleEnableRule: (id) =>
    set((state) => {
      const index = state.rules.findIndex((r) => r.id === id)
      if (state.rules[index]) {
        state.rules[index].enabled = !state.rules[index].enabled
      }
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
  setSelectedRuleId: (id) =>
    set((state) => {
      state.selectedRuleId = id
    }),

  setPreviewOriginalRequests: (enable) =>
    set((state) => {
      state.previewOriginalRequests = enable
    }),
  setRules: (rules) =>
    set((state) => {
      state.rules = rules
    }),
})
