import { BrowserEventSchema } from '@/schemas/recording'
import { z } from 'zod'

export const BrowserEventsCapturedSchema = z.object({
  type: z.literal('events-captured'),
  events: z.array(BrowserEventSchema),
})

export const BrowserMessageSchema = BrowserEventsCapturedSchema
