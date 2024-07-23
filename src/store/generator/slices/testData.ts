import { ImmerStateCreator } from '@/utils/typescript'
import { Variable, TestData } from '@/types/testData'

interface Actions {
  setVariables: (variables: Variable[]) => void
}

export type TestDataStore = TestData & Actions

export const createTestDataSlice: ImmerStateCreator<TestDataStore> = (set) => ({
  variables: [],

  setVariables: (variables: Variable[]) =>
    set((state) => {
      state.variables = variables
    }),
})
