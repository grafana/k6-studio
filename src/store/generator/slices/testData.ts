import { Variable, TestData, DataFile } from '@/types/testData'
import { ImmerStateCreator } from '@/utils/typescript'

interface Actions {
  setVariables: (variables: Variable[]) => void
  setFiles: (files: DataFile[]) => void
}

export type TestDataStore = TestData & Actions

export const createTestDataSlice: ImmerStateCreator<TestDataStore> = (set) => ({
  variables: [],
  files: [],

  setVariables: (variables: Variable[]) =>
    set((state) => {
      state.variables = variables
    }),
  setFiles: (files: DataFile[]) =>
    set((state) => {
      state.files = files
    }),
})
