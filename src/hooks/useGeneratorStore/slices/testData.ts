import { ImmerStateCreator } from '@/utils/typescript'
import { Variable } from '@/types'

interface State {
  variables: Variable[]
}

interface Actions {
  setVariables: (variables: Variable[]) => void
}

export type TestDataStore = State & Actions

export const createTestDataSlice: ImmerStateCreator<TestDataStore> = (set) => ({
  variables: [],

  setVariables: (variables: Variable[]) =>
    set((state) => {
      state.variables = variables
    }),
})
