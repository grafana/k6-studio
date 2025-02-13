import { z } from 'zod'

const BrowserEventBaseSchema = z.object({
  eventId: z.string(),
  timestamp: z.number(),
})

const NavigatedToPageEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('navigated-to-page'),
  tab: z.string(),
  url: z.string(),
  source: z.union([z.literal('address-bar'), z.literal('history')]),
})

const ReloadedPageEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('reloaded-page'),
  tab: z.string(),
  url: z.string(),
})

const ClickedEventSchema = BrowserEventBaseSchema.extend({
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

const InputChangedEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('input-changed'),
  tab: z.string(),
  selector: z.string(),
  value: z.string(),
})

const CheckChangedEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('check-changed'),
  tab: z.string(),
  selector: z.string(),
  checked: z.boolean(),
})

const RadioChangedEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('radio-changed'),
  tab: z.string(),
  selector: z.string(),
  name: z.string(),
  value: z.string(),
})

const SelectChangedEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('select-changed'),
  tab: z.string(),
  selector: z.string(),
  selected: z.array(z.string()),
  multiple: z.boolean(),
})

export const BrowserEventSchema = z.discriminatedUnion('type', [
  NavigatedToPageEventSchema,
  ReloadedPageEventSchema,
  ClickedEventSchema,
  InputChangedEventSchema,
  CheckChangedEventSchema,
  RadioChangedEventSchema,
  SelectChangedEventSchema,
])

export type NavigatedToPageEvent = z.infer<typeof NavigatedToPageEventSchema>
export type ReloadedPageEvent = z.infer<typeof ReloadedPageEventSchema>
export type ClickedEvent = z.infer<typeof ClickedEventSchema>
export type InputChangedEvent = z.infer<typeof InputChangedEventSchema>
export type CheckChangedEvent = z.infer<typeof CheckChangedEventSchema>
export type RadioChangedEvent = z.infer<typeof RadioChangedEventSchema>
export type SelectChangedEvent = z.infer<typeof SelectChangedEventSchema>

export type BrowserEvent = z.infer<typeof BrowserEventSchema>
