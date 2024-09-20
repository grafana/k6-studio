import { GeneratorFileData } from '@/types/generator'
import { type GeneratorStore } from '@/store/generator'
import { TestOptions } from '@/types/testOptions'
import { exhaustive } from '@/utils/typescript'
import { isNonStaticAssetResponse } from '@/utils/staticAssets'

export function selectRuleById(state: GeneratorStore, id?: string) {
  return state.rules.find((rule) => rule.id === id)
}

export function selectSelectedRule(state: GeneratorStore) {
  if (!state.selectedRuleId) {
    return
  }
  return selectRuleById(state, state.selectedRuleId)
}

export function selectIsRulePreviewable(state: GeneratorStore) {
  const rule = selectSelectedRule(state)
  return rule?.type === 'correlation'
}

export function selectHasRecording(state: GeneratorStore) {
  return state.requests.length > 0
}

export function selectFilteredRequests(state: GeneratorStore) {
  const allowedRequests = state.requests.filter((request) => {
    return state.allowlist.includes(request.request.host)
  })

  return state.includeStaticAssets
    ? allowedRequests
    : allowedRequests.filter(isNonStaticAssetResponse)
}

export function selectGeneratorData(state: GeneratorStore): GeneratorFileData {
  const loadProfile = selectLoadProfile(state)
  const {
    sleepType,
    timing,
    variables,
    recordingPath,
    rules,
    allowlist,
    includeStaticAssets,
    scriptName,
  } = state

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
    includeStaticAssets,
    scriptName,
  }
}

function selectLoadProfile({
  executor,
  stages,
  vus,
  iterations,
}: GeneratorStore): TestOptions['loadProfile'] {
  switch (executor) {
    case 'ramping-vus':
      return {
        executor,
        stages,
      }
    case 'shared-iterations':
      return {
        executor,
        vus,
        iterations,
      }
    default:
      return exhaustive(executor)
  }
}
