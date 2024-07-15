import { ImmerStateCreator } from '@/utils/typescript'
import { VariablesState, VariablesActions, Variable } from '../types'

export const createVariablesSlice: ImmerStateCreator<
  VariablesState & VariablesActions
> = (set) => ({
  variables: [],

  setVariables: (variables: Variable[]) =>
    set((state) => {
      state.variables = variables
    }),
})
