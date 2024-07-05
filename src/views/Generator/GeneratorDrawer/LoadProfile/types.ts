import { ExecutorType } from '@/constants/generator'

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
