import { GeneratorFileData } from '@/types/generator'
import { RampingStage } from '@/types/testOptions'

import { createEmptyRule } from './rules'

export function createNewGeneratorFile(recordingPath = ''): GeneratorFileData {
  return {
    version: '2.0',
    recordingPath,
    options: {
      loadProfile: {
        executor: 'ramping-vus',
        stages: getInitialStages(),
      },
      thinkTime: {
        sleepType: 'groups',
        timing: {
          type: 'fixed',
          value: 1,
        },
      },
      thresholds: [],
      cloud: {
        loadZones: {
          distribution: 'even',
          zones: [],
        },
      },
    },
    testData: {
      variables: [],
      files: [],
    },
    rules: [createEmptyRule('verification')],
    allowlist: [],
    includeStaticAssets: false,
    scriptName: 'my-script.js',
  }
}

export function createStage(target: number, duration = ''): RampingStage {
  return {
    target,
    duration,
  }
}

export function getInitialStages() {
  return [createStage(20, '1m'), createStage(20, '3m30s'), createStage(0, '1m')]
}
