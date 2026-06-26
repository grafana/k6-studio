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

export function getLoadSummary(profile: LoadProfileExecutorOptions): string {
  if (profile.executor === 'shared-iterations') {
    const iterations = profile.iterations ?? 1
    const vus = profile.vus ?? 1

    return `${iterations} iteration${iterations === 1 ? '' : 's'} shared across ${vus} virtual user${vus === 1 ? '' : 's'}`
  }

  const stages = profile.stages ?? []

  if (stages.length === 0) {
    return 'No load stages configured'
  }

  const peak = Math.max(...stages.map((stage) => stage.target))
  const totalSeconds = stages.reduce(
    (total, stage) => total + parseDurationSeconds(stage.duration),
    0
  )

  return `Up to ${peak} virtual user${peak === 1 ? '' : 's'} for ~${formatDuration(totalSeconds)}`
}

export interface StageSegment {
  kind: 'ramp-up' | 'steady' | 'ramp-down'
  label: string
  detail: string
  /** Raw stage duration (e.g. "1m30s"); empty for shared-iterations. */
  duration: string
  /** Duration in seconds, used as the segment's flex weight. */
  seconds: number
}

const STAGE_LABELS: Record<StageSegment['kind'], string> = {
  'ramp-up': 'Ramp up',
  steady: 'Steady',
  'ramp-down': 'Ramp down',
}

function classifyStage(previous: number, target: number): StageSegment['kind'] {
  if (target > previous) return 'ramp-up'
  if (target < previous) return 'ramp-down'
  return 'steady'
}

/**
 * Describes each load-profile stage for the run-test timeline. Ramping profiles
 * map one segment per stage (relative to the previous target); shared-iterations
 * has no stages, so it collapses to a single steady segment.
 */
export function buildStageSegments(
  profile: LoadProfileExecutorOptions
): StageSegment[] {
  if (profile.executor === 'shared-iterations') {
    return [
      {
        kind: 'steady',
        label: STAGE_LABELS.steady,
        detail: `${profile.vus ?? 1} VUs`,
        duration: '',
        seconds: 1,
      },
    ]
  }

  return profile.stages.map((stage, index) => {
    const previous = index === 0 ? 0 : (profile.stages[index - 1]?.target ?? 0)
    const kind = classifyStage(previous, stage.target)

    return {
      kind,
      label: STAGE_LABELS[kind],
      detail:
        kind === 'steady'
          ? `${stage.target} VUs`
          : `${previous} → ${stage.target} VUs`,
      duration: stage.duration,
      seconds: parseDurationSeconds(stage.duration),
    }
  })
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
    .filter((threshold) => threshold.enabled !== false)
    .map((threshold) => formatThreshold(threshold, config))
    .join(' · ')
}
