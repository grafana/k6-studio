import { GeneratorFileData } from '@/types/generator'
import { RampingStage } from '@/types/testOptions'

export function createNewGeneratorFile(recordingPath = ''): GeneratorFileData {
  return {
    name: 'New test generator',
    version: '0',
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
    },
    testData: {
      variables: [],
    },
    rules: [],
    allowlist: [],
  }
}

export function createStage(
  target: number | string = '',
  duration = ''
): RampingStage {
  return {
    target,
    duration,
  }
}

export function getInitialStages() {
  return [createStage(20, '1m'), createStage(20, '3m30s'), createStage(0, '1m')]
}