import { type GeneratorStore } from '@/store/generator'
import { GeneratorFileData } from '@/types/generator'
import { TestOptions } from '@/types/testOptions'
import { isNonStaticAssetResponse } from '@/utils/staticAssets'
import { exhaustive } from '@/utils/typescript'

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
  return (
    ['correlation', 'parameterization'].includes(rule?.type ?? '') &&
    rule?.enabled
  )
}

export function selectHasRecording(state: GeneratorStore) {
  return selectFilteredRequests(state).length > 0
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
    thresholds,
    loadZones,
    variables,
    files,
    recordingPath,
    rules,
    allowlist,
    includeStaticAssets,
    scriptName,
  } = state

  return {
    version: '2.0',
    recordingPath,
    options: {
      loadProfile,
      thinkTime: {
        sleepType,
        timing,
      },
      thresholds,
      cloud: { loadZones },
    },
    testData: { variables, files },
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

export function selectHasVerificationRule(state: GeneratorStore) {
  return state.rules.some((rule) => rule.type === 'verification')
}

export function selectHasGroups(state: GeneratorStore) {
  return state.requests.some((request) => request.group)
}

export function selectSelectedRuleIndex(state: GeneratorStore) {
  const selectedRule = selectSelectedRule(state)
  if (!selectedRule) {
    return 0
  }

  return state.rules
    .filter((rule) => rule.type === selectedRule.type)
    .findIndex((rule) => rule.id === state.selectedRuleId)
}
