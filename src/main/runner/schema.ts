import { z } from 'zod'

// Generic options schema to allow any options object. Should be refined later.
const GenericOptions = z.unknown()

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

const PageGotoActionSchema = z.object({
  type: z.literal('page.goto'),
  url: z.string(),
  options: GenericOptions.optional(),
})

const PageReloadActionSchema = z.object({
  type: z.literal('page.reload'),
  options: GenericOptions.optional(),
})

const PageWaitForNavigationActionSchema = z.object({
  type: z.literal('page.waitForNavigation'),
  options: GenericOptions.optional(),
})

const GenericPageActionSchema = z.object({
  type: z.literal('page.*'),
  method: z.string(),
  args: z.array(z.unknown()),
})

const LocatorClickActionSchema = z.object({
  type: z.literal('locator.click'),
  locator: ActionLocatorSchema,
  options: GenericOptions.optional(),
})

const LocatorFillActionSchema = z.object({
  type: z.literal('locator.fill'),
  locator: ActionLocatorSchema,
  value: z.string(),
  options: GenericOptions.optional(),
})

const LocatorCheckActionSchema = z.object({
  type: z.literal('locator.check'),
  locator: ActionLocatorSchema,
  options: GenericOptions.optional(),
})

const LocatorUncheckActionSchema = z.object({
  type: z.literal('locator.uncheck'),
  locator: ActionLocatorSchema,
  options: GenericOptions.optional(),
})

const LocatorSelectOptionActionSchema = z.object({
  type: z.literal('locator.selectOption'),
  locator: ActionLocatorSchema,
  values: z.array(
    z.object({
      value: z.string().optional(),
      label: z.string().optional(),
      index: z.number().optional(),
    })
  ),
  options: GenericOptions.optional(),
})

const LocatorWaitForActionSchema = z.object({
  type: z.literal('locator.waitFor'),
  locator: ActionLocatorSchema,
  options: GenericOptions.optional(),
})

const GenericLocatorActionSchema = z.object({
  type: z.literal('locator.*'),
  method: z.string(),
  locator: ActionLocatorSchema,
  args: z.array(z.unknown()),
})

const GenericBrowserContextActionSchema = z.object({
  type: z.literal('browserContext.*'),
  method: z.string(),
  args: z.array(z.unknown()),
})

export const AnyBrowserActionSchema = z.discriminatedUnion('type', [
  // BrowserContext actions
  GenericBrowserContextActionSchema,

  // Page actions
  PageGotoActionSchema,
  PageReloadActionSchema,
  PageWaitForNavigationActionSchema,
  GenericPageActionSchema,

  // Locator actions
  LocatorClickActionSchema,
  LocatorFillActionSchema,
  LocatorCheckActionSchema,
  LocatorUncheckActionSchema,
  LocatorSelectOptionActionSchema,
  LocatorWaitForActionSchema,
  GenericLocatorActionSchema,
])

const ActionEventSchemaBase = z.object({
  eventId: z.string(),
  action: AnyBrowserActionSchema,
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

export const ActionAbortedSchema = z.object({
  type: z.literal('aborted'),
})

export const ActionResult = z.discriminatedUnion('type', [
  ActionSuccessSchema,
  ActionErrorSchema,
  ActionAbortedSchema,
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

export type PageGotoAction = z.infer<typeof PageGotoActionSchema>
export type PageReloadAction = z.infer<typeof PageReloadActionSchema>
export type PageWaitForNavigationAction = z.infer<
  typeof PageWaitForNavigationActionSchema
>
export type GenericPageAction = z.infer<typeof GenericPageActionSchema>

export type LocatorClickAction = z.infer<typeof LocatorClickActionSchema>
export type LocatorFillAction = z.infer<typeof LocatorFillActionSchema>
export type LocatorCheckAction = z.infer<typeof LocatorCheckActionSchema>
export type LocatorUncheckAction = z.infer<typeof LocatorUncheckActionSchema>
export type LocatorSelectOptionAction = z.infer<
  typeof LocatorSelectOptionActionSchema
>
export type LocatorWaitForAction = z.infer<typeof LocatorWaitForActionSchema>
export type GenericLocatorAction = z.infer<typeof GenericLocatorActionSchema>

export type GenericBrowserContextAction = z.infer<
  typeof GenericBrowserContextActionSchema
>

export type AnyBrowserAction = z.infer<typeof AnyBrowserActionSchema>
