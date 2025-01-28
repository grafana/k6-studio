import { discriminatedUnion, z } from 'zod'

const BrowserEventBaseSchema = z.object({
  eventId: z.string(),
  timestamp: z.number(),
})

const PageNavigationEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('page-navigation'),
  tab: z.string(),
  url: z.string(),
  source: z.union([
    z.literal('interaction'),
    z.literal('address-bar'),
    z.literal('history'),
    z.literal('script'),
  ]),
})

const PageReloadEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('page-reload'),
  tab: z.string(),
  url: z.string(),
})

const ClickEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('click'),
  tab: z.string(),
  selector: z.string(),
  button: z.union([z.literal('left'), z.literal('middle'), z.literal('right')]),
  modifiers: z.object({
    ctrl: z.boolean(),
    shift: z.boolean(),
    alt: z.boolean(),
    meta: z.boolean(),
  }),
})

export const BrowserEventSchema = discriminatedUnion('type', [
  PageNavigationEventSchema,
  PageReloadEventSchema,
  ClickEventSchema,
])

export type PageNavigationEvent = z.infer<typeof PageNavigationEventSchema>
export type PageReloadEvent = z.infer<typeof PageReloadEventSchema>
export type ClickEvent = z.infer<typeof ClickEventSchema>

export type BrowserEvent = z.infer<typeof BrowserEventSchema>
