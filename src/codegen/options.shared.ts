import { LoadZoneData } from '@/types/testOptions'

type Threshold = {
  id: string
  metric: string
  statistic: string
  condition: string
  value: number
  stopTest: boolean
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

    const thresholdValue = `${threshold.statistic}${threshold.condition}${threshold.value}`

    if (threshold.stopTest) {
      result[key].push({ threshold: thresholdValue, abortOnFail: true })
    } else {
      result[key].push(thresholdValue)
    }
  })

  return result
}

export function generateCloudOptions({
  loadZones,
}: {
  loadZones: LoadZoneData
}) {
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
