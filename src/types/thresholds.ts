import { z } from 'zod'
import { ThresholdSchema } from '@/schemas/generator'

export type Threshold = z.infer<typeof ThresholdSchema>
