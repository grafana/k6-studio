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
import { createScriptDataSlice, ScriptDataStore } from './slices/script'

export interface GeneratorStore
  extends RecordingSliceStore,
    RulesSliceStore,
    TestDataStore,
    TestOptionsStore,
    ScriptDataStore {
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
    ...createScriptDataSlice(set, ...rest),
    setGeneratorFile: (
      {
        options: { thinkTime, loadProfile },
        testData: { variables },
        recordingPath,
        rules,
        allowlist,
        includeStaticAssets,
        scriptName,
      },
      recording = []
    ) =>
      set((state) => {
        // options
        state.sleepType = thinkTime.sleepType
        state.timing = thinkTime.timing
        state.executor = loadProfile.executor
        switch (loadProfile.executor) {
          case 'ramping-vus':
            state.stages = loadProfile.stages
            break
          case 'shared-iterations':
            state.iterations = loadProfile.iterations
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

        if (allowlist.length === 0 && recording.length > 0) {
          state.showAllowlistDialog = true
        }

        state.includeStaticAssets = includeStaticAssets
        state.scriptName = scriptName
        // rules
        state.rules = rules
      }),
  }))
)
