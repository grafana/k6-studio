import { z } from 'zod'
import { ExecutorType } from '@/constants/generator'

export const SleepTypeSchema = z.enum(['groups', 'requests', 'iterations'])

export const FixedTimingSchema = z.object({
  type: z.literal('fixed'),
  value: z.number().nullable(),
})

export const RangeTimingSchema = z.object({
  type: z.literal('range'),
  value: z.object({
    min: z.number().nullable(),
    max: z.number().nullable(),
  }),
})

export const TimingSchema = z.discriminatedUnion('type', [
  FixedTimingSchema,
  RangeTimingSchema,
])

export const ThinkTimeSchema = z.object({
  sleepType: SleepTypeSchema,
  timing: TimingSchema,
})

export const CommonOptionsSchema = z.object({
  executor: z.nativeEnum(ExecutorType),
  startTime: z.string().optional(),
  gracefulStop: z.string().optional(),
})

export const SharedIterationsOptionsSchema = CommonOptionsSchema.extend({
  executor: z.literal(ExecutorType.SharedIterations),
  vus: z.union([z.number(), z.literal('')]).optional(),
  iterations: z.number().optional(),
  maxDuration: z.string().optional(),
})

export const RampingStageSchema = z.object({
  id: z.string().optional(),
  target: z.union([z.string(), z.number()]).optional(),
  duration: z.string(),
})

export const RampingVUsOptionsSchema = CommonOptionsSchema.extend({
  executor: z.literal(ExecutorType.RampingVUs),
  stages: RampingStageSchema.array(),
  startVUs: z.union([z.number(), z.literal('')]).optional(),
  gracefulRampDown: z.string().optional(),
})

export const LoadProfileExecutorOptionsSchema = z.discriminatedUnion(
  'executor',
  [SharedIterationsOptionsSchema, RampingVUsOptionsSchema]
)

export const TestOptionsSchema = z.object({
  loadProfile: LoadProfileExecutorOptionsSchema,
  thinkTime: ThinkTimeSchema,
})
