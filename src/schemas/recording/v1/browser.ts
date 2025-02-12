import { discriminatedUnion, z } from 'zod'

const BrowserEventBaseSchema = z.object({
  eventId: z.string(),
  timestamp: z.number(),
})

const PageNavigationEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('navigated-to-page'),
  tab: z.string(),
  url: z.string(),
  source: z.union([z.literal('address-bar'), z.literal('history')]),
})

const PageReloadEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('reloaded-page'),
  tab: z.string(),
  url: z.string(),
})

const ClickEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('clicked'),
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
  type: z.literal('input-changed'),
  tab: z.string(),
  selector: z.string(),
  value: z.string(),
})

const CheckEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('check-changed'),
  tab: z.string(),
  selector: z.string(),
  checked: z.boolean(),
})

const SwitchEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('radio-changed'),
  tab: z.string(),
  selector: z.string(),
  name: z.string(),
  value: z.string(),
})

const SelectEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('select-changed'),
  tab: z.string(),
  selector: z.string(),
  selected: z.array(z.string()),
  multiple: z.boolean(),
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
