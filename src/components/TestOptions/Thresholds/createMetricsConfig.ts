import { ThresholdStatstic } from '@/types/testOptions'
import { exhaustive } from '@/utils/typescript'

export type MetricUnit = '' | 'ms' | 'reqs' | 'bytes' | '%'
export type MetricType = 'trend' | 'counter' | 'rate'

export interface MetricMeta {
  label: string
  unit: MetricUnit
  type: MetricType
}

export interface StatisticOption {
  label: string
  value: ThresholdStatstic
}

export interface MetricsConfig<M extends string = string> {
  options: Array<{ value: M; label: string }>
  getStatisticOptions: (metric: M) => StatisticOption[]
  getMetricUnit: (metric: M) => MetricUnit
}

export function createMetricsConfig<M extends string>(
  metricsMap: Record<M, MetricMeta>
): MetricsConfig<M> {
  const options = (Object.entries(metricsMap) as Array<[M, MetricMeta]>).map(
    ([value, { label }]) => ({ value, label })
  )

  function getStatisticOptions(metric: M): StatisticOption[] {
    const { type } = metricsMap[metric]

    switch (type) {
      case 'counter':
        return [{ label: 'Count', value: 'count' }]
      case 'rate':
        return [{ label: 'Rate', value: 'rate' }]
      case 'trend':
        return [
          { label: '99th percentile', value: 'p(99)' },
          { label: '95th percentile', value: 'p(95)' },
          { label: '90th percentile', value: 'p(90)' },
          { label: '50th percentile', value: 'p(50)' },
          { label: 'Mean', value: 'avg' },
          { label: 'Max', value: 'max' },
          { label: 'Min', value: 'min' },
        ]
      default:
        return exhaustive(type)
    }
  }

  function getMetricUnit(metric: M): MetricUnit {
    return metricsMap[metric].unit
  }

  return { options, getStatisticOptions, getMetricUnit }
}
