import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { extractUniqueJsonPaths } from '@/store/generator/slices/recording.utils'
import { ProxyData } from '@/types'
import { GeneratorFileData } from '@/types/generator'
import { exhaustive } from '@/utils/typescript'

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
        options: { thinkTime, loadProfile, thresholds, cloud },
        testData: { variables, files },
        recordingPath,
        rules,
        allowlist,
        includeStaticAssets,
        scriptName,
      },
      recording = []
    ) =>
      set((state) => {
        state.selectedRuleId = null
        // options
        state.sleepType = thinkTime.sleepType
        state.timing = thinkTime.timing
        state.loadZones = cloud.loadZones
        state.thresholds = thresholds
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
        state.files = files
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
        state.previewOriginalRequests = false

        /**
         * Store request level metadata.
         * This uniqifies the json paths across all requests, since the json paths already are precomputed.
         * Using a simple set based merge strategy
         */
        const { requestJsonPaths, responseJsonPaths } = extractUniqueJsonPaths(
          state.requests
        )

        state.metadata = {
          requestJsonPaths,
          responseJsonPaths,
        }
      }),
  }))
)
