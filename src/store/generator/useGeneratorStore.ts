import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { GeneratorState } from './types'
import {
  createRulesSlice,
  createTestDataSlice,
  createTestOptionsSlice,
} from './slices'
import { createRecordingSlice } from './slices/recording'
import { exhaustive } from '@/utils/typescript'

export const useGeneratorStore = create<GeneratorState>()(
  immer((set, ...rest) => ({
    ...createRecordingSlice(set, ...rest),
    ...createRulesSlice(set, ...rest),
    ...createTestDataSlice(set, ...rest),
    ...createTestOptionsSlice(set, ...rest),
    name: generateNewName(),
    setName: (name) =>
      set((state) => {
        state.name = name
      }),
    setGeneratorFile: (
      {
        name,
        options: { thinkTime, loadProfile },
        testData: { variables },
        recordingPath,
        rules,
        allowlist,
      },
      recording = []
    ) =>
      set((state) => {
        state.name = name
        // options
        state.sleepType = thinkTime.sleepType
        state.timing = thinkTime.timing
        state.executor = loadProfile.executor
        state.startTime = loadProfile.startTime
        state.gracefulStop = loadProfile.gracefulStop
        switch (loadProfile.executor) {
          case 'ramping-vus':
            state.stages = loadProfile.stages
            state.gracefulRampDown = loadProfile.gracefulRampDown
            state.startVUs = loadProfile.startVUs
            break
          case 'shared-iterations':
            state.iterations = loadProfile.iterations
            state.maxDuration = loadProfile.maxDuration
            state.vus = loadProfile.vus
            break
          default:
            exhaustive(loadProfile)
        }
        // data
        state.variables = variables
        // recording
        state.requests = recording
        state.recordingPath = recordingPath
        state.showAllowListDialog = false
        state.allowList = allowlist
        // rules
        state.rules = rules
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
