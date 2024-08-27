import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import {
  createRecordingSlice,
  createRulesSlice,
  createTestDataSlice,
  createTestOptionsSlice,
  RecordingSliceStore,
  RulesSliceStore,
  TestDataStore,
  TestOptionsStore,
} from './slices'
import { exhaustive } from '@/utils/typescript'
import { GeneratorFileData } from '@/types/generator'
import { ProxyData } from '@/types'

export interface GeneratorStore
  extends RecordingSliceStore,
    RulesSliceStore,
    TestDataStore,
    TestOptionsStore {
  setGeneratorFile: (
    generatorFile: GeneratorFileData,
    recording?: ProxyData[]
  ) => void
}

export const useGeneratorStore = create<GeneratorStore>()(
  immer((set, ...rest) => ({
    ...createRecordingSlice(set, ...rest),
    ...createRulesSlice(set, ...rest),
    ...createTestDataSlice(set, ...rest),
    ...createTestOptionsSlice(set, ...rest),
    setGeneratorFile: (
      {
        options: { thinkTime, loadProfile },
        testData: { variables },
        recordingPath,
        rules,
        allowlist,
        includeStaticAssets,
      },
      recording = []
    ) =>
      set((state) => {
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
        state.allowlist = allowlist
        state.includeStaticAssets = includeStaticAssets
        // rules
        state.rules = rules
      }),
  }))
)
