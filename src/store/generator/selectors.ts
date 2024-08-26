import { GeneratorFileData } from '@/types/generator'
import type { GeneratorState } from './types'
import { TestOptions } from '@/types/testOptions'
import { exhaustive } from '@/utils/typescript'
import { isNonStaticAssetResponse } from '@/utils/staticAssets'

export function selectRuleById(state: GeneratorState, id?: string) {
  return state.rules.find((rule) => rule.id === id)
}

export function selectHasRecording(state: GeneratorState) {
  return state.requests.length > 0
}

function selectAllowedRequests(state: GeneratorState) {
  return state.requests.filter((request) => {
    return state.allowlist.includes(request.request.host)
  })
}

export function selectFilteredRequests(state: GeneratorState) {
  const requests = selectAllowedRequests(state)

  return state.includeStaticAssets
    ? requests
    : requests.filter(isNonStaticAssetResponse)
}

export function selectStaticAssetCount(state: GeneratorState) {
  return (
    state.requests.length -
    state.requests.filter(isNonStaticAssetResponse).length
  )
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
