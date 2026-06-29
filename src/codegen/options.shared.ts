import { LoadZoneData } from '@/types/testOptions'

type ThresholdShape = {
  metric: string
  statistic: string
  condition: string
  value: number
  stopTest: boolean
  enabled?: boolean
}

type AbortableThreshold = {
  threshold: string
  abortOnFail: boolean
}

export function generateThresholds<T extends ThresholdShape>(
  thresholds: readonly T[]
) {
  return thresholds
    .filter((threshold) => threshold.enabled !== false)
    .reduce<Record<string, Array<string | AbortableThreshold>>>(
      (acc, { metric, statistic, condition, value, stopTest }) => {
        const expression = `${statistic}${condition}${value}`
        const entry: string | AbortableThreshold = stopTest
          ? { threshold: expression, abortOnFail: true }
          : expression
        acc[metric] = [...(acc[metric] ?? []), entry]
        return acc
      },
      {}
    )
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
  return Object.fromEntries(
    loadZones.map(({ loadZone, percent }) => [
      `'${loadZone}'`,
      { loadZone, percent },
    ])
  )
}
