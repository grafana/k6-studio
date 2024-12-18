import { z } from 'zod'
import {
  SleepTypeSchema,
  FixedTimingSchema,
  RangeTimingSchema,
  TimingSchema,
  ThinkTimeSchema,
  CommonOptionsSchema,
  SharedIterationsOptionsSchema,
  RampingVUsOptionsSchema,
  RampingStageSchema,
  LoadProfileExecutorOptionsSchema,
  TestOptionsSchema,
} from '@/schemas/generator'

export type SleepType = z.infer<typeof SleepTypeSchema>
export type FixedTiming = z.infer<typeof FixedTimingSchema>
export type RangeTiming = z.infer<typeof RangeTimingSchema>
export type Timing = z.infer<typeof TimingSchema>
export type ThinkTime = z.infer<typeof ThinkTimeSchema>
export type CommonOptions = z.infer<typeof CommonOptionsSchema>
export type SharedIterationsOptions = z.infer<
  typeof SharedIterationsOptionsSchema
>
export type RampingStage = z.infer<typeof RampingStageSchema>
export type RampingVUsOptions = z.infer<typeof RampingVUsOptionsSchema>
export type LoadProfileExecutorOptions = z.infer<
  typeof LoadProfileExecutorOptionsSchema
>
export type TestOptions = z.infer<typeof TestOptionsSchema>
