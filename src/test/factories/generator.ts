import { GeneratorStore } from '@/store/generator'
import { GeneratorFileData } from '@/types/generator'
import { vi } from 'vitest'

export function createGeneratorData(
  data?: Partial<GeneratorFileData>
): GeneratorFileData {
  return {
    allowlist: [],
    includeStaticAssets: false,
    options: {
      loadProfile: {
        executor: 'ramping-vus',
        stages: [],
      },
      thinkTime: {
        sleepType: 'groups',
        timing: {
          type: 'fixed',
          value: 1,
        },
      },
    },
    recordingPath: '',
    rules: [],
    scriptName: 'script.js',
    testData: {
      variables: [],
    },
    version: '2.0',
    thresholds: [],
    ...data,
  }
}

export function createGeneratorState(
  state?: Partial<GeneratorStore>
): GeneratorStore {
  return {
    addRule: vi.fn(),
    cloneRule: vi.fn(),
    deleteRule: vi.fn(),
    toggleEnableRule: vi.fn(),
    rules: [],
    swapRules: vi.fn(),
    updateRule: vi.fn(),

    includeStaticAssets: false,
    setIncludeStaticAssets: vi.fn(),

    scriptName: 'script.js',
    setScriptName: vi.fn(),

    recordingPath: '',
    setGeneratorFile: vi.fn(),
    resetRecording: vi.fn(),
    setRecording: vi.fn(),

    allowlist: [],
    setAllowlist: vi.fn(),
    showAllowlistDialog: false,
    setShowAllowlistDialog: vi.fn(),

    selectedRuleId: '',
    setSelectedRuleId: vi.fn(),

    executor: 'ramping-vus',
    setExecutor: vi.fn(),

    iterations: 1,
    setIterations: vi.fn(),

    requests: [],

    sleepType: 'groups',
    setSleepType: vi.fn(),

    stages: [],
    setStages: vi.fn(),

    timing: {
      type: 'fixed',
      value: 1,
    },
    setTiming: vi.fn(),

    variables: [],
    setVariables: vi.fn(),

    vus: 1,
    setVus: vi.fn(),

    thresholds: [],
    addThreshold: vi.fn(),
    updateThreshold: vi.fn(),
    deleteThreshold: vi.fn(),

    ...state,
  }
}
