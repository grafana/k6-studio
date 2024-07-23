import { GeneratorFileData } from '@/types/generator'
import type { GeneratorState } from './types'
import { TestOptions } from '@/types/testOptions'

export function selectSelectedRule(state: GeneratorState) {
  if (!state.selectedRuleId) {
    return
  }

  const rule = state.rules.find((rule) => rule.id === state.selectedRuleId)

  if (!rule) {
    // TODO: make sure this is handled
    console.error('Rule not found')
  }

  return rule
}

export function selectHasRecording(state: GeneratorState) {
  return state.requests.length > 0
}

export function selectFilteredRequests(state: GeneratorState) {
  return state.requests.filter((request) => {
    return state.allowList.includes(request.request.host)
  })
}

export function selectGeneratorData({
  name,
  executor,
  startTime,
  gracefulStop,
  gracefulRampDown,
  stages,
  startVUs,
  vus,
  iterations,
  maxDuration,
  sleepType,
  timing,
  variables,
  recordingPath,
  rules,
  allowList,
}: GeneratorState): GeneratorFileData {
  const loadProfile: TestOptions['loadProfile'] =
    executor === 'ramping-vus'
      ? {
          executor,
          startTime,
          gracefulStop,
          stages,
          startVUs,
          gracefulRampDown,
        }
      : {
          executor,
          startTime,
          gracefulStop,
          vus,
          iterations,
          maxDuration,
        }

  return {
    name,
    version: '0',
    recordingPath,
    options: {
      loadProfile,
      thinkTime: {
        sleepType,
        timing,
      },
    },
    testData: { variables },
    rules,
    allowlist: allowList,
  }
}
