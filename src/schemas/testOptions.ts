import { z } from 'zod'

export const SleepTypeSchema = z.enum(['groups', 'requests', 'iterations'])

export const FixedTimingSchema = z.object({
  type: z.literal('fixed'),
  value: z.number().nonnegative().nullable(),
})

export const RangeTimingSchema = z.object({
  type: z.literal('range'),
  value: z
    .object({
      min: z.number().nonnegative(),
      max: z.number().nonnegative(),
    })
    .refine(({ min, max }) => max > min, {
      message: 'Max must be greater than min',
      path: ['max'],
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

export const SharedIterationsOptionsSchema = CommonOptionsSchema.extend({
  executor: z.literal('shared-iterations'),
  vus: z.number().nonnegative().int().optional(),
  iterations: z.number().nonnegative().int().optional(),
})

export const RampingStageSchema = z.object({
  id: z.string().optional(),
  target: z.number().nonnegative().int(),
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
