import { discriminatedUnion, z } from 'zod'

const BrowserEventBaseSchema = z.object({
  eventId: z.string(),
  timestamp: z.number(),
})

const PageNavigationEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('page-navigation'),
  tab: z.string(),
  url: z.string(),
})

const DummyEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('dummy'),
  selector: z.string(),
  message: z.string(),
})

export const BrowserEventSchema = discriminatedUnion('type', [
  DummyEventSchema,
  PageNavigationEventSchema,
])

export type DummyEvent = z.infer<typeof DummyEventSchema>
export type BrowserEvent = z.infer<typeof BrowserEventSchema>
