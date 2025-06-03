import { omit } from 'lodash-es'

import { LoadZoneData, TestOptions, Threshold } from '@/types/testOptions'

import { stringify } from './codegen.utils'

export function generateOptions({
  loadProfile,
  thresholds,
  cloud,
}: TestOptions): string {
  const options = omit(loadProfile, ['executor'])
  const data = {
    ...options,
    ...(cloud && generateCloudOptions(cloud)),
    ...(thresholds.length > 0 && {
      thresholds: generateThresholds(thresholds),
    }),
  }
  return stringify(data)
}

type AbortableThreshold = {
  threshold: string
  abortOnFail: boolean
}

export function generateThresholds(thresholds: Threshold[]) {
  const result: Record<string, Array<string | AbortableThreshold>> = {}

  thresholds.forEach((threshold) => {
    const key = threshold.metric

    if (!result[key]) {
      result[key] = []
    }

    const thresholdValue = getThresholdValue(threshold)

    if (threshold.stopTest) {
      result[key].push({ threshold: thresholdValue, abortOnFail: true })
    } else {
      result[key].push(thresholdValue)
    }
  })

  return result
}

export function generateCloudOptions({ loadZones }: TestOptions['cloud']) {
  if (loadZones.zones.length === 0) return {}

  return {
    cloud: {
      distribution: generateLoadZones(loadZones.zones),
    },
  }
}

export function generateLoadZones(loadZones: LoadZoneData['zones']) {
  const result: Record<string, { loadZone: string; percent: number }> = {}

  loadZones.forEach(({ loadZone, percent }) => {
    result[`'${loadZone}'`] = { loadZone, percent }
  })

  return result
}

function getThresholdValue(threshold: Threshold) {
  let thresholdValue = threshold.value
  if (threshold.metric === 'http_req_failed') {
    thresholdValue = threshold.value / 100
  }

  return `${threshold.statistic}${threshold.condition}${thresholdValue}`
}
