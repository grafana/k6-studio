import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export interface Variable {
  name: string
  value: string
}

interface VariablesState {
  variables: Variable[]
}

interface VariablesActions {
  setVariables: (variables: Variable[]) => void
}

export const useVariablesStore = create<VariablesState & VariablesActions>()(
  immer((set) => ({
    variables: [],

    setVariables: (variables: Variable[]) =>
      set((state) => {
        state.variables = variables
      }),
  }))
)
