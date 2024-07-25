import { GeneratorFileData } from '@/types/generator'
import type { GeneratorState } from './types'
import { TestOptions } from '@/types/testOptions'
import { exhaustive } from '@/utils/typescript'

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
    return state.allowlist.includes(request.request.host)
  })
}

export function selectGeneratorData(state: GeneratorState): GeneratorFileData {
  const loadProfile = selectLoadProfile(state)
  const {
    name,
    sleepType,
    timing,
    variables,
    recordingPath,
    rules,
    allowlist,
  } = state

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
    allowlist,
  }
}

function selectLoadProfile({
  executor,
  startTime,
  gracefulStop,
  stages,
  startVUs,
  gracefulRampDown,
  vus,
  iterations,
  maxDuration,
}: GeneratorState): TestOptions['loadProfile'] {
  switch (executor) {
    case 'ramping-vus':
      return {
        executor,
        startTime,
        gracefulStop,
        stages,
        startVUs,
        gracefulRampDown,
      }
    case 'shared-iterations':
      return {
        executor,
        startTime,
        gracefulStop,
        vus,
        iterations,
        maxDuration,
      }
    default:
      return exhaustive(executor)
  }
}
