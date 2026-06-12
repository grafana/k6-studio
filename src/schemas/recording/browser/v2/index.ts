import { z } from 'zod/v4'

const AriaDetailsSchema = z.object({
  roles: z.array(z.string()),
  labels: z.array(z.string()),
  name: z.string().optional(),
})

const RoleElementSelectorSchema = z.object({
  role: z.string(),
  name: z.string(),
})

const ElementSelectorSchema = z.object({
  css: z.string(),
  testId: z.string().optional(),
  alt: z.string().optional(),
  label: z.string().optional(),
  placeholder: z.string().optional(),
  title: z.string().optional(),
  role: RoleElementSelectorSchema.optional(),
})

const BrowserEventTargetSchema = z.object({
  selectors: ElementSelectorSchema,
  aria: AriaDetailsSchema.optional(),
})

const BrowserEventBaseSchema = z.object({
  eventId: z.string(),
  timestamp: z.number(),
})

// Events that target an element also record the chain of iframe elements from
// the top frame down to the frame the element lives in, outermost first. Absent
// or empty means the top frame. Page-level events (navigation, reload) have no
// element target and so no frame scope; they extend the base directly.
const TargetedEventBaseSchema = BrowserEventBaseSchema.extend({
  frames: BrowserEventTargetSchema.array().optional(),
})

const TabOpenedEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('tab-opened'),
  tab: z.string(),
})

const NavigateToPageEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('navigate-to-page'),
  tab: z.string(),
  url: z.string(),
  source: z.union([
    z.literal('address-bar'),
    z.literal('history'),
    z.literal('implicit'),
  ]),
})

const ReloadPageEventSchema = BrowserEventBaseSchema.extend({
  type: z.literal('reload-page'),
  tab: z.string(),
  url: z.string(),
})

const ClickEventSchema = TargetedEventBaseSchema.extend({
  type: z.literal('click'),
  tab: z.string(),
  target: BrowserEventTargetSchema,
  button: z.union([z.literal('left'), z.literal('middle'), z.literal('right')]),
  modifiers: z.object({
    ctrl: z.boolean(),
    shift: z.boolean(),
    alt: z.boolean(),
    meta: z.boolean(),
  }),
})

const InputChangeEventSchema = TargetedEventBaseSchema.extend({
  type: z.literal('input-change'),
  tab: z.string(),
  target: BrowserEventTargetSchema,
  value: z.string(),
  sensitive: z.boolean(),
})

const CheckChangeEventSchema = TargetedEventBaseSchema.extend({
  type: z.literal('check-change'),
  tab: z.string(),
  target: BrowserEventTargetSchema,
  checked: z.boolean(),
})

const RadioChangeEventSchema = TargetedEventBaseSchema.extend({
  type: z.literal('radio-change'),
  tab: z.string(),
  target: BrowserEventTargetSchema,
  name: z.string(),
  value: z.string(),
})

const SelectChangeEventSchema = TargetedEventBaseSchema.extend({
  type: z.literal('select-change'),
  tab: z.string(),
  target: BrowserEventTargetSchema,
  selected: z.array(z.string()),
  multiple: z.boolean(),
})

const SubmitFormEventSchema = TargetedEventBaseSchema.extend({
  type: z.literal('submit-form'),
  tab: z.string(),
  form: BrowserEventTargetSchema,
  submitter: BrowserEventTargetSchema,
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

const AssertEventSchema = TargetedEventBaseSchema.extend({
  type: z.literal('assert'),
  tab: z.string(),
  target: BrowserEventTargetSchema,
  assertion: AssertionSchema,
})

const WaitForEventSchema = TargetedEventBaseSchema.extend({
  type: z.literal('wait-for'),
  tab: z.string(),
  target: BrowserEventTargetSchema,
  options: z
    .object({
      timeout: z.number().int().optional(),
      state: z
        .union([
          z.literal('attached'),
          z.literal('detached'),
          z.literal('visible'),
          z.literal('hidden'),
        ])
        .optional(),
    })
    .optional(),
})

export const BrowserEventSchema = z.discriminatedUnion('type', [
  TabOpenedEventSchema,
  NavigateToPageEventSchema,
  ReloadPageEventSchema,
  ClickEventSchema,
  InputChangeEventSchema,
  CheckChangeEventSchema,
  RadioChangeEventSchema,
  SelectChangeEventSchema,
  SubmitFormEventSchema,
  AssertEventSchema,
  WaitForEventSchema,
])

export const BrowserEventsSchema = z.object({
  version: z.literal('2'),
  events: BrowserEventSchema.array(),
})

export type AriaDetails = z.infer<typeof AriaDetailsSchema>
export type BrowserEventTarget = z.infer<typeof BrowserEventTargetSchema>

export type RoleElementSelector = z.infer<typeof RoleElementSelectorSchema>
export type ElementSelector = z.infer<typeof ElementSelectorSchema>
export type CheckState = z.infer<typeof CheckStateSchema>

export type TabOpenedEvent = z.infer<typeof TabOpenedEventSchema>
export type NavigateToPageEvent = z.infer<typeof NavigateToPageEventSchema>
export type ReloadPageEvent = z.infer<typeof ReloadPageEventSchema>
export type ClickEvent = z.infer<typeof ClickEventSchema>
export type InputChangeEvent = z.infer<typeof InputChangeEventSchema>
export type CheckChangeEvent = z.infer<typeof CheckChangeEventSchema>
export type RadioChangeEvent = z.infer<typeof RadioChangeEventSchema>
export type SelectChangeEvent = z.infer<typeof SelectChangeEventSchema>
export type SubmitFormEvent = z.infer<typeof SubmitFormEventSchema>
export type AssertEvent = z.infer<typeof AssertEventSchema>
export type WaitForEvent = z.infer<typeof WaitForEventSchema>

export type TextAssertion = z.infer<typeof TextAssertionSchema>
export type VisibilityAssertion = z.infer<typeof VisibilityAssertionSchema>
export type CheckAssertion = z.infer<typeof CheckAssertionSchema>
export type TextInputAssertion = z.infer<typeof TextInputAssertionSchema>
export type Assertion = z.infer<typeof AssertionSchema>

export type BrowserEvent = z.infer<typeof BrowserEventSchema>
