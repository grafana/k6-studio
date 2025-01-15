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

const PageReloadEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('page-reload'),
  tab: z.string(),
  url: z.string(),
})

export const BrowserEventSchema = discriminatedUnion('type', [
  PageNavigationEventSchema,
  PageReloadEventSchema,
])

export type BrowserEvent = z.infer<typeof BrowserEventSchema>
