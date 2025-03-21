import { z } from 'zod'

import { BrowserEventSchema } from '@/schemas/recording'

export const BrowserEventsCapturedSchema = z.object({
  type: z.literal('events-captured'),
  events: z.array(BrowserEventSchema),
})

export const BrowserMessageSchema = BrowserEventsCapturedSchema
