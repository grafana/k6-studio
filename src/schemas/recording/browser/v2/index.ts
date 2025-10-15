import { z } from 'zod'

const ElementSelectorSchema = z.object({
  css: z.string(),
  testId: z.string().optional(),
})

const EventTargetSchema = z.object({
  selectors: ElementSelectorSchema,
})

const BrowserEventBaseSchema = z.object({
  eventId: z.string(),
  timestamp: z.number(),
})

const NavigateToPageEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('navigate-to-page'),
  tab: z.string(),
  url: z.string(),
  source: z.union([z.literal('address-bar'), z.literal('history')]),
})

const ReloadPageEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('reload-page'),
  tab: z.string(),
  url: z.string(),
})

const ClickEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('click'),
  tab: z.string(),
  target: EventTargetSchema,
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
  target: EventTargetSchema,
  value: z.string(),
  sensitive: z.boolean(),
})

const CheckChangeEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('check-change'),
  tab: z.string(),
  target: EventTargetSchema,
  checked: z.boolean(),
})

const RadioChangeEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('radio-change'),
  tab: z.string(),
  target: EventTargetSchema,
  name: z.string(),
  value: z.string(),
})

const SelectChangeEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('select-change'),
  tab: z.string(),
  target: EventTargetSchema,
  selected: z.array(z.string()),
  multiple: z.boolean(),
})

const SubmitFormEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('submit-form'),
  tab: z.string(),
  form: EventTargetSchema,
  submitter: EventTargetSchema,
})

const TextAssertionSchema = z.object({
  type: z.literal('text'),
  operation: z.object({
    type: z.literal('contains'),
    value: z.string(),
  }),
})

const VisibilityAssertionSchema = z.object({
  type: z.literal('visibility'),
  visible: z.boolean(),
})

const CheckStateSchema = z.union([
  z.literal('checked'),
  z.literal('unchecked'),
  z.literal('indeterminate'),
])

const CheckAssertionSchema = z.object({
  type: z.literal('check'),
  inputType: z.union([z.literal('aria'), z.literal('native')]),
  expected: CheckStateSchema,
})

const TextInputAssertionSchema = z.object({
  type: z.literal('text-input'),
  expected: z.string(),
})

const AssertionSchema = z.discriminatedUnion('type', [
  TextAssertionSchema,
  VisibilityAssertionSchema,
  CheckAssertionSchema,
  TextInputAssertionSchema,
])

const AssertEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('assert'),
  tab: z.string(),
  target: EventTargetSchema,
  assertion: AssertionSchema,
})

export const BrowserEventSchema = z.discriminatedUnion('type', [
  NavigateToPageEventSchema,
  ReloadPageEventSchema,
  ClickEventSchema,
  InputChangeEventSchema,
  CheckChangeEventSchema,
  RadioChangeEventSchema,
  SelectChangeEventSchema,
  SubmitFormEventSchema,
  AssertEventSchema,
])

export const BrowserEventsSchema = z.object({
  version: z.literal('2'),
  events: BrowserEventSchema.array(),
})

export type ElementSelector = z.infer<typeof ElementSelectorSchema>
export type CheckState = z.infer<typeof CheckStateSchema>

export type NavigateToPageEvent = z.infer<typeof NavigateToPageEventSchema>
export type ReloadPageEvent = z.infer<typeof ReloadPageEventSchema>
export type ClickEvent = z.infer<typeof ClickEventSchema>
export type InputChangeEvent = z.infer<typeof InputChangeEventSchema>
export type CheckChangeEvent = z.infer<typeof CheckChangeEventSchema>
export type RadioChangeEvent = z.infer<typeof RadioChangeEventSchema>
export type SelectChangeEvent = z.infer<typeof SelectChangeEventSchema>
export type SubmitFormEvent = z.infer<typeof SubmitFormEventSchema>
export type AssertEvent = z.infer<typeof AssertEventSchema>

export type TextAssertion = z.infer<typeof TextAssertionSchema>
export type VisibilityAssertion = z.infer<typeof VisibilityAssertionSchema>
export type CheckAssertion = z.infer<typeof CheckAssertionSchema>
export type TextInputAssertion = z.infer<typeof TextInputAssertionSchema>
export type Assertion = z.infer<typeof AssertionSchema>

export type BrowserEvent = z.infer<typeof BrowserEventSchema>
