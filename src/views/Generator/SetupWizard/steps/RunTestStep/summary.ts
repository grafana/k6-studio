import { MetricsConfig } from '@/components/TestOptions/Thresholds/createMetricsConfig'
import { LoadProfileExecutorOptions, Threshold } from '@/types/testOptions'

export function parseDurationSeconds(duration: string): number {
  const matches = duration.matchAll(/(\d+)([hms])/g)
  const multipliers = { h: 3600, m: 60, s: 1 }

  return [...matches].reduce(
    (total, [, value, unit]) =>
      total + Number(value) * multipliers[unit as 'h' | 'm' | 's'],
    0
  )
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [
    hours > 0 ? `${hours}h` : '',
    minutes > 0 ? `${minutes}m` : '',
    seconds > 0 ? `${seconds}s` : '',
  ]
    .filter(Boolean)
    .join(' ')
}

function formatVUs(count: number): string {
  return count === 1 ? '1 VU' : `${count} VUs`
}

interface LoadSummary {
  headline: string
  detail: string
}

export function getLoadSummary(
  profile: LoadProfileExecutorOptions
): LoadSummary {
  if (profile.executor === 'shared-iterations') {
    const iterations = profile.iterations ?? 1
    const vus = profile.vus ?? 1

    return {
      headline: `${iterations} iteration${iterations === 1 ? '' : 's'} shared across ${vus} virtual user${vus === 1 ? '' : 's'}`,
      detail: '',
    }
  }

  const stages = profile.stages ?? []

  if (stages.length === 0) {
    return { headline: 'No load stages configured', detail: '' }
  }

  const peak = Math.max(...stages.map((stage) => stage.target))
  const totalSeconds = stages.reduce(
    (total, stage) => total + parseDurationSeconds(stage.duration),
    0
  )

  const detail = stages
    .map((stage, index) => {
      const previous = index === 0 ? 0 : (stages[index - 1]?.target ?? 0)

      if (stage.target === previous) {
        return `hold ${formatVUs(stage.target)} for ${stage.duration}`
      }

      if (stage.target < previous) {
        return `ramp down to ${stage.target} over ${stage.duration}`
      }

      return `ramp to ${formatVUs(stage.target)} over ${stage.duration}`
    })
    .join(' · ')

  return {
    headline: `Up to ${peak} virtual user${peak === 1 ? '' : 's'} for ~${formatDuration(totalSeconds)}`,
    detail: detail.charAt(0).toUpperCase() + detail.slice(1),
  }
}

function formatThreshold(
  threshold: Threshold,
  config: MetricsConfig<string>
): string {
  const statistic = threshold.statistic.replace(/^p\((\d+)\)$/, 'p$1')
  const suffix = threshold.stopTest ? ' (stops test)' : ''

  if (threshold.metric === 'http_req_failed') {
    // toFixed(6) drops IEEE-754 noise (0.07 * 100 = 7.000000000000001); Number
    // trims the trailing zeros so legitimate decimals (7.5%) still render.
    const percentage =
      threshold.value <= 1
        ? `${Number((threshold.value * 100).toFixed(6))}%`
        : `${threshold.value}`

    return `error rate ${threshold.condition} ${percentage}${suffix}`
  }

  const unit = config.getMetricUnit(threshold.metric)

  if (threshold.metric === 'http_req_duration') {
    return `${statistic} ${threshold.condition} ${threshold.value}${unit}${suffix}`
  }

  const label =
    config.options.find((option) => option.value === threshold.metric)?.label ??
    threshold.metric

  return `${label} ${statistic} ${threshold.condition} ${threshold.value}${unit ? ` ${unit}` : ''}${suffix}`
}

export function formatThresholds(
  thresholds: Threshold[],
  config: MetricsConfig<string>
): string {
  return thresholds
    .filter((threshold) => threshold.enabled)
    .map((threshold) => formatThreshold(threshold, config))
    .join(' · ')
}
