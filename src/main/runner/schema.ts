import { z } from 'zod'

const CssLocatorSchema = z.object({
  type: z.literal('css'),
  selector: z.string(),
})

const GetByRoleLocatorSchema = z.object({
  type: z.literal('role'),
  role: z.string(),
  options: z.object({
    name: z.string().optional(),
  }),
})

const GetByTestIdLocatorSchema = z.object({
  type: z.literal('testid'),
  testId: z.string(),
})

const GetByAltTextLocatorSchema = z.object({
  type: z.literal('alt'),
  text: z.string(),
})

const GetByLabelLocatorSchema = z.object({
  type: z.literal('label'),
  label: z.string(),
})

const GetByPlaceholderLocatorSchema = z.object({
  type: z.literal('placeholder'),
  placeholder: z.string(),
})
const GetByTitleLocatorSchema = z.object({
  type: z.literal('title'),
  title: z.string(),
})

const GetByTextLocatorSchema = z.object({
  type: z.literal('text'),
  text: z.string(),
})

const ActionLocatorSchema = z.discriminatedUnion('type', [
  CssLocatorSchema,
  GetByRoleLocatorSchema,
  GetByTestIdLocatorSchema,
  GetByAltTextLocatorSchema,
  GetByLabelLocatorSchema,
  GetByPlaceholderLocatorSchema,
  GetByTitleLocatorSchema,
  GetByTextLocatorSchema,
])

const GotoActionSchema = z.object({
  type: z.literal('goto'),
  url: z.string(),
})

const ClickActionSchema = z.object({
  type: z.literal('click'),
  locator: ActionLocatorSchema,
})

export const BrowserActionSchema = z.discriminatedUnion('type', [
  GotoActionSchema,
  ClickActionSchema,
])

const ActionEventSchemaBase = z.object({
  eventId: z.string(),
  action: BrowserActionSchema,
})

export const ActionBeginEventSchema = ActionEventSchemaBase.extend({
  type: z.literal('begin'),
  timestamp: z.object({
    started: z.number(),
  }),
})

export const ActionSuccessSchema = z.object({
  type: z.literal('success'),
  returnValue: z.unknown().optional(),
})

export const ActionErrorSchema = z.object({
  type: z.literal('error'),
  error: z.string(),
})

export const ActionResult = z.discriminatedUnion('type', [
  ActionSuccessSchema,
  ActionErrorSchema,
])

export const ActionEndEventSchema = ActionEventSchemaBase.extend({
  type: z.literal('end'),
  timestamp: z.object({
    started: z.number(),
    ended: z.number(),
  }),
  result: ActionResult,
})

export const BrowserActionEventSchema = z.discriminatedUnion('type', [
  ActionBeginEventSchema,
  ActionEndEventSchema,
])

export type ActionLocator = z.infer<typeof ActionLocatorSchema>

export type ActionBeginEvent = z.infer<typeof ActionBeginEventSchema>
export type ActionEndEvent = z.infer<typeof ActionEndEventSchema>

export type BrowserActionEvent = z.infer<typeof BrowserActionEventSchema>

export type ActionResult = z.infer<typeof ActionResult>

export type GotoAction = z.infer<typeof GotoActionSchema>
export type ClickAction = z.infer<typeof ClickActionSchema>
export type BrowserAction = z.infer<typeof BrowserActionSchema>
