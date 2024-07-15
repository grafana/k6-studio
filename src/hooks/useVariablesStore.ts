import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface Variable {
  name: string
  value: string
}

interface VariablesStore {
  variables: Variable[]
  setVariables: (variables: Variable[]) => void
}

export const useVariablesStore = create<VariablesStore>()(
  immer((set) => ({
    variables: [],

    setVariables: (variables: Variable[]) =>
      set((state) => {
        state.variables = variables
      }),
  }))
)
