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

export const CommonOptions = z.object({
  executor: z.nativeEnum(ExecutorType),
  startTime: z.string().optional(),
  gracefulStop: z.string().optional(),
})

export const SharedIterationsOptions = CommonOptions.extend({
  executor: z.literal(ExecutorType.SharedIterations),
  vus: z.union([z.number(), z.literal('')]).optional(),
  iterations: z.number().optional(),
  maxDuration: z.string().optional(),
})

export const RampingStage = z.object({
  id: z.string().optional(),
  target: z.union([z.string(), z.number()]).optional(),
  duration: z.string(),
})

export const RampingVUsOptions = CommonOptions.extend({
  executor: z.literal(ExecutorType.RampingVUs),
  stages: RampingStage.array(),
  startVUs: z.union([z.number(), z.literal('')]).optional(),
  gracefulRampDown: z.string().optional(),
})

export const LoadProfileExecutorOptions = z.discriminatedUnion('executor', [
  SharedIterationsOptions,
  RampingVUsOptions,
])

export type SleepType = z.infer<typeof SleepType>
export type FixedTiming = z.infer<typeof FixedTiming>
export type RangeTiming = z.infer<typeof RangeTiming>
export type Timing = z.infer<typeof Timing>
export type ThinkTime = z.infer<typeof ThinkTime>
export type CommonOptions = z.infer<typeof CommonOptions>
export type SharedIterationsOptions = z.infer<typeof SharedIterationsOptions>
export type RampingStage = z.infer<typeof RampingStage>
export type RampingVUsOptions = z.infer<typeof RampingVUsOptions>
export type LoadProfileExecutorOptions = z.infer<
  typeof LoadProfileExecutorOptions
>
