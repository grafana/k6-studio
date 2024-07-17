import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { GeneratorState } from './types'
import {
  createRulesSlice,
  createTestDataSlice,
  createTestOptionsSlice,
} from './slices'
import { createRecordingSlice } from './slices/recording'

export const useGeneratorStore = create<GeneratorState>()(
  immer((set, ...rest) => ({
    ...createRecordingSlice(set, ...rest),
    ...createRulesSlice(set, ...rest),
    ...createTestDataSlice(set, ...rest),
    ...createTestOptionsSlice(set, ...rest),
    name: generateNewName(),
    setName: (name: string) =>
      set((state) => {
        state.name = name
      }),
  }))
)

function generateNewName() {
  const formatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
  const formattedDate = formatter.format(new Date())
  return `Generator ${formattedDate}`
}
