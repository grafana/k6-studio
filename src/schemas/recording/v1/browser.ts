import { z } from 'zod'

const DummyEvent = z.object({
  eventId: z.string(),
  timestamp: z.number(),
  type: z.literal('dummy'),
  selector: z.string(),
  message: z.string(),
})

export const BrowserEventSchema = DummyEvent

export type DummyEvent = z.infer<typeof DummyEvent>
export type BrowserEvent = z.infer<typeof BrowserEventSchema>
