import { TestOptions } from '@/types/testOptions'
import { stringify } from './codegen.utils'
import { omit } from 'lodash-es'
import { Threshold } from '@/types/thresholds'

export function generateOptions(
  { loadProfile }: TestOptions,
  thresholdData: Threshold[]
): string {
  const options = omit(loadProfile, ['executor'])
  const data = {
    ...options,
    ...(thresholdData.length > 0 && {
      thresholds: generateThresholds(thresholdData),
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
    const key =
      threshold.url !== '*'
        ? `'${threshold.metric}{url:${threshold.url}}'`
        : threshold.metric

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
