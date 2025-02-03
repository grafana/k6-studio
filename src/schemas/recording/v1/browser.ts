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

const InputChangeEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('input-change'),
  tab: z.string(),
  selector: z.string(),
  value: z.string(),
})

const CheckEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('check'),
  tab: z.string(),
  selector: z.string(),
  checked: z.boolean(),
})

const SwitchEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('switch'),
  tab: z.string(),
  selector: z.string(),
  name: z.string(),
  value: z.string(),
})

const SelectEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('select'),
  tab: z.string(),
  selector: z.string(),
  selected: z.array(z.string()),
})

export const BrowserEventSchema = discriminatedUnion('type', [
  PageNavigationEventSchema,
  PageReloadEventSchema,
  ClickEventSchema,
  InputChangeEventSchema,
  CheckEventSchema,
  SwitchEventSchema,
  SelectEventSchema,
])

export type PageNavigationEvent = z.infer<typeof PageNavigationEventSchema>
export type PageReloadEvent = z.infer<typeof PageReloadEventSchema>
export type ClickEvent = z.infer<typeof ClickEventSchema>
export type InputChangeEvent = z.infer<typeof InputChangeEventSchema>
export type CheckEventSchema = z.infer<typeof CheckEventSchema>
export type SwitchEventSchema = z.infer<typeof SwitchEventSchema>
export type SelectEventSchema = z.infer<typeof SelectEventSchema>

export type BrowserEvent = z.infer<typeof BrowserEventSchema>
