import { z } from 'zod'
import {
  ThresholdDataSchema,
  ThresholdMetricSchema,
  ThresholdSchema,
  ThresholdStatisticSchema,
} from '@/schemas/generator'

export type Threshold = z.infer<typeof ThresholdSchema>
export type ThresholdData = z.infer<typeof ThresholdDataSchema>
export type ThresholdMetric = z.infer<typeof ThresholdMetricSchema>
export type ThresholdStatstic = z.infer<typeof ThresholdStatisticSchema>
