import { ExecutorType } from '@/constants/generator'

export type SleepType = 'groups' | 'requests' | 'iterations'

export interface FixedTiming {
  type: 'fixed'
  value: number | null
}

export interface RangeTiming {
  type: 'range'
  value: {
    min: number | null
    max: number | null
  }
}

export type Timing = FixedTiming | RangeTiming

export interface SleepTypeConfig {
  sleepType: SleepType
  timing: Timing
}

export interface CommonOptions {
  executor: ExecutorType
  startTime?: string
  gracefulStop?: string
}

export interface SharedIterationsOptions extends CommonOptions {
  executor: ExecutorType.SharedIterations
  vus?: number | ''
  iterations?: number
  maxDuration?: string
}

export interface RampingStage {
  id?: string
  target?: string | number
  duration: string
}

export interface RampingVUsOptions extends CommonOptions {
  executor: ExecutorType.RampingVUs
  stages: RampingStage[]
  startVUs?: number | ''
  gracefulRampDown?: string
}

export type LoadProfileExecutorOptions =
  | SharedIterationsOptions
  | RampingVUsOptions
