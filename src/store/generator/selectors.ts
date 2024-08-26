import { GeneratorFileData } from '@/types/generator'
import type { GeneratorStore } from '@/store/generator'
import { TestOptions } from '@/types/testOptions'
import { exhaustive } from '@/utils/typescript'
import { isNonStaticAssetResponse } from '@/utils/staticAssets'

export function selectRuleById(state: GeneratorStore, id?: string) {
  return state.rules.find((rule) => rule.id === id)
}

export function selectHasRecording(state: GeneratorStore) {
  return state.requests.length > 0
}

export function selectAllowedRequests(state: GeneratorStore) {
  return state.requests.filter((request) => {
    return state.allowlist.includes(request.request.host)
  })
}

export function selectFilteredRequests(state: GeneratorStore) {
  const requests = selectAllowedRequests(state)

  return state.includeStaticAssets
    ? requests
    : requests.filter(isNonStaticAssetResponse)
}

export function selectStaticAssetCount(state: GeneratorStore) {
  const allowedRequests = selectAllowedRequests(state)
  return (
    allowedRequests.length -
    allowedRequests.filter(isNonStaticAssetResponse).length
  )
}

export function selectGeneratorData(state: GeneratorStore): GeneratorFileData {
  const loadProfile = selectLoadProfile(state)
  const { sleepType, timing, variables, recordingPath, rules, allowlist } =
    state

  return {
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
}: GeneratorStore): TestOptions['loadProfile'] {
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
