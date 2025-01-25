import { z } from 'zod'
import { ThresholdMetricSchema, ThresholdSchema } from '@/schemas/generator'

export type Threshold = z.infer<typeof ThresholdSchema>
export type ThresholdMetric = z.infer<typeof ThresholdMetricSchema>
