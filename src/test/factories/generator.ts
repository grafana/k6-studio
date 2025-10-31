import { vi } from 'vitest'

import { GeneratorStore } from '@/store/generator'
import { GeneratorFileData } from '@/types/generator'

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
      thresholds: [],
      cloud: {
        loadZones: {
          distribution: 'even',
          zones: [],
        },
      },
    },
    recordingPath: '',
    rules: [],
    scriptName: 'script.js',
    testData: {
      variables: [],
      files: [],
    },
    version: '2.0',
    ...data,
  }
}

export function createGeneratorState(
  state?: Partial<GeneratorStore>
): GeneratorStore {
  return {
    metadata: {
      requestJsonPaths: [],
      responseJsonPaths: [],
    },
    addRule: vi.fn(),
    setRules: vi.fn(),
    cloneRule: vi.fn(),
    deleteRule: vi.fn(),
    toggleEnableRule: vi.fn(),
    rules: [],
    previewOriginalRequests: false,
    swapRules: vi.fn(),
    updateRule: vi.fn(),
    setPreviewOriginalRequests: vi.fn(),

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
    files: [],
    setVariables: vi.fn(),
    setFiles: vi.fn(),

    vus: 1,
    setVus: vi.fn(),

    thresholds: [],
    setThresholds: vi.fn(),

    loadZones: {
      distribution: 'even',
      zones: [],
    },
    setLoadZones: vi.fn(),

    ...state,
  }
}
