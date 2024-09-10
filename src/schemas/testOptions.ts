import { z } from 'zod'

export const SleepTypeSchema = z.enum(['groups', 'requests', 'iterations'])

export const FixedTimingSchema = z.object({
  type: z.literal('fixed'),
  value: z.number().nonnegative().nullable(),
})

export const RangeTimingSchema = z.object({
  type: z.literal('range'),
  value: z.object({
    min: z.number().nonnegative().nullable(),
    max: z.number().nonnegative().nullable(),
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
  executor: z.enum(['shared-iterations', 'ramping-vus']),
})

// TODO: check if z.literal('') can be removed
// TODO: check if vus can be optional
export const SharedIterationsOptionsSchema = CommonOptionsSchema.extend({
  executor: z.literal('shared-iterations'),
  vus: z.union([z.number().nonnegative().int(), z.literal('')]).optional(),
  iterations: z.number().nonnegative().int().optional(),
})

// TODO: check if target z.string can be removed
export const RampingStageSchema = z.object({
  id: z.string().optional(),
  target: z.union([z.string(), z.number().nonnegative().int()]).optional(),
  duration: z
    .string()
    .regex(
      /^(\d+([hms]))$|^(\d+h)(\d+m)(\d+s)$|^(\d+h)(\d+m)$|^(\d+m)(\d+s)$/,
      {
        message: 'Must be in format 1m30s',
      }
    ),
})

export const RampingVUsOptionsSchema = CommonOptionsSchema.extend({
  executor: z.literal('ramping-vus'),
  stages: RampingStageSchema.array(),
})

export const LoadProfileExecutorOptionsSchema = z.discriminatedUnion(
  'executor',
  [SharedIterationsOptionsSchema, RampingVUsOptionsSchema]
)

export const TestOptionsSchema = z.object({
  loadProfile: LoadProfileExecutorOptionsSchema,
  thinkTime: ThinkTimeSchema,
})
