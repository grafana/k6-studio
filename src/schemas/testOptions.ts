import { z } from 'zod'
import { ExecutorType } from '@/constants/generator'

export const SleepType = z.enum(['groups', 'requests', 'iterations'])

export const FixedTiming = z.object({
  type: z.literal('fixed'),
  value: z.number().nullable(),
})

export const RangeTiming = z.object({
  type: z.literal('range'),
  value: z.object({
    min: z.number().nullable(),
    max: z.number().nullable(),
  }),
})

export const Timing = z.discriminatedUnion('type', [FixedTiming, RangeTiming])

export const ThinkTime = z.object({
  sleepType: SleepType,
  timing: Timing,
})

export type SleepType = z.infer<typeof SleepType>
export type FixedTiming = z.infer<typeof FixedTiming>
export type RangeTiming = z.infer<typeof RangeTiming>
export type Timing = z.infer<typeof Timing>
export type ThinkTime = z.infer<typeof ThinkTime>

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
