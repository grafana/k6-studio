import { z } from 'zod'

const ElementSelectorSchema = z.object({
  css: z.string(),
})

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
  selector: ElementSelectorSchema,
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
  selector: ElementSelectorSchema,
  value: z.string(),
  sensitive: z.boolean(),
})

const CheckChangedEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('check-changed'),
  tab: z.string(),
  selector: ElementSelectorSchema,
  checked: z.boolean(),
})

const RadioChangedEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('radio-changed'),
  tab: z.string(),
  selector: ElementSelectorSchema,
  name: z.string(),
  value: z.string(),
})

const SelectChangedEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('select-changed'),
  tab: z.string(),
  selector: ElementSelectorSchema,
  selected: z.array(z.string()),
  multiple: z.boolean(),
})

const FormSubmittedEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('form-submitted'),
  tab: z.string(),
  form: ElementSelectorSchema,
  submitter: ElementSelectorSchema,
})

const TextAssertionSchema = z.object({
  type: z.literal('text'),
  operation: z.object({
    type: z.literal('contains'),
    value: z.string(),
  }),
})

// Will eventually be a union of different assertion types
const AssertionSchema = TextAssertionSchema

const AssertedEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('assert'),
  tab: z.string(),
  selector: ElementSelectorSchema,
  assertion: AssertionSchema,
})

export const BrowserEventSchema = z.discriminatedUnion('type', [
  NavigatedToPageEventSchema,
  ReloadedPageEventSchema,
  ClickedEventSchema,
  InputChangedEventSchema,
  CheckChangedEventSchema,
  RadioChangedEventSchema,
  SelectChangedEventSchema,
  FormSubmittedEventSchema,
  AssertedEventSchema,
])

export type ElementSelector = z.infer<typeof ElementSelectorSchema>

export type NavigatedToPageEvent = z.infer<typeof NavigatedToPageEventSchema>
export type ReloadedPageEvent = z.infer<typeof ReloadedPageEventSchema>
export type ClickedEvent = z.infer<typeof ClickedEventSchema>
export type InputChangedEvent = z.infer<typeof InputChangedEventSchema>
export type CheckChangedEvent = z.infer<typeof CheckChangedEventSchema>
export type RadioChangedEvent = z.infer<typeof RadioChangedEventSchema>
export type SelectChangedEvent = z.infer<typeof SelectChangedEventSchema>
export type FormSubmittedEvent = z.infer<typeof FormSubmittedEventSchema>
export type AssertedEvent = z.infer<typeof AssertedEventSchema>

export type BrowserEvent = z.infer<typeof BrowserEventSchema>
