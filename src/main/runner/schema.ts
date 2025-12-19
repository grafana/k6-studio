import type { eventWithTime } from '@rrweb/types'
import { z } from 'zod'

/**
 * Creates a fault-tolerant schema that returns `undefined` on failure. This is used
 * to guard against the user passing invalid options that would otherwise cause the entire
 * schema to fail.
 */
function safe<T>(schema: z.ZodType<T>) {
  return schema.optional().catch(undefined)
}

// Generic options schema to allow any options object. Should be refined later.
const GenericOptions = z.unknown()

const CssLocatorSchema = z.object({
  type: z.literal('css'),
  selector: z.string(),
})

const GetByRoleLocatorSchema = z.object({
  type: z.literal('role'),
  role: z.string(),
  options: z
    .object({
      name: z.string().optional(),
    })
    .optional(),
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
  method: z.literal('page.goto'),
  url: z.string(),
  options: GenericOptions.optional(),
})

const PageReloadActionSchema = z.object({
  method: z.literal('page.reload'),
  options: GenericOptions.optional(),
})

const PageWaitForNavigationActionSchema = z.object({
  method: z.literal('page.waitForNavigation'),
  options: GenericOptions.optional(),
})

const GenericPageActionSchema = z.object({
  method: z.literal('page.*'),
  name: z.string(),
  args: z.array(z.unknown()),
})

const LocatorClickOptionSchema = z
  .object({
    button: safe(
      z.union([z.literal('left'), z.literal('middle'), z.literal('right')])
    ),
    modifiers: safe(
      z.array(
        z.union([
          z.literal('Alt'),
          z.literal('Control'),
          z.literal('Meta'),
          z.literal('Shift'),
        ])
      )
    ),
  })
  .passthrough()

const LocatorClickActionSchema = z.object({
  method: z.literal('locator.click'),
  locator: ActionLocatorSchema,
  options: LocatorClickOptionSchema.optional(),
})

const LocatorDoubleClickActionSchema = z.object({
  method: z.literal('locator.dblclick'),
  locator: ActionLocatorSchema,
  options: LocatorClickOptionSchema.optional(),
})

const LocatorFillActionSchema = z.object({
  method: z.literal('locator.fill'),
  locator: ActionLocatorSchema,
  value: z.string(),
  options: GenericOptions.optional(),
})

const LocatorCheckActionSchema = z.object({
  method: z.literal('locator.check'),
  locator: ActionLocatorSchema,
  options: GenericOptions.optional(),
})

const LocatorUncheckActionSchema = z.object({
  method: z.literal('locator.uncheck'),
  locator: ActionLocatorSchema,
  options: GenericOptions.optional(),
})

const LocatorSelectOptionActionSchema = z.object({
  method: z.literal('locator.selectOption'),
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
  method: z.literal('locator.waitFor'),
  locator: ActionLocatorSchema,
  options: GenericOptions.optional(),
})

const LocatorHoverActionSchema = z.object({
  method: z.literal('locator.hover'),
  locator: ActionLocatorSchema,
  options: GenericOptions.optional(),
})

const LocatorSetCheckedActionSchema = z.object({
  method: z.literal('locator.setChecked'),
  locator: ActionLocatorSchema,
  checked: z.boolean(),
  options: GenericOptions.optional(),
})

const LocatorTypeActionSchema = z.object({
  method: z.literal('locator.type'),
  locator: ActionLocatorSchema,
  text: z.string(),
  options: GenericOptions.optional(),
})

const LocatorPressActionSchema = z.object({
  method: z.literal('locator.press'),
  locator: ActionLocatorSchema,
  key: z.string(),
  options: GenericOptions.optional(),
})

const LocatorClearActionSchema = z.object({
  method: z.literal('locator.clear'),
  locator: ActionLocatorSchema,
  options: GenericOptions.optional(),
})

const LocatorTapActionSchema = z.object({
  method: z.literal('locator.tap'),
  locator: ActionLocatorSchema,
  options: GenericOptions.optional(),
})

const LocatorFocusActionSchema = z.object({
  method: z.literal('locator.focus'),
  locator: ActionLocatorSchema,
  options: GenericOptions.optional(),
})

const GenericLocatorActionSchema = z.object({
  method: z.literal('locator.*'),
  name: z.string(),
  locator: ActionLocatorSchema,
  args: z.array(z.unknown()),
})

const GenericBrowserContextActionSchema = z.object({
  method: z.literal('browserContext.*'),
  name: z.string(),
  args: z.array(z.unknown()),
})

export const AnyBrowserActionSchema = z.discriminatedUnion('method', [
  // BrowserContext actions
  GenericBrowserContextActionSchema,

  // Page actions
  PageGotoActionSchema,
  PageReloadActionSchema,
  PageWaitForNavigationActionSchema,
  GenericPageActionSchema,

  // Locator actions
  LocatorCheckActionSchema,
  LocatorClearActionSchema,
  LocatorClickActionSchema,
  LocatorDoubleClickActionSchema,
  LocatorFillActionSchema,
  LocatorFocusActionSchema,
  LocatorHoverActionSchema,
  LocatorPressActionSchema,
  LocatorSelectOptionActionSchema,
  LocatorSetCheckedActionSchema,
  LocatorTapActionSchema,
  LocatorTypeActionSchema,
  LocatorUncheckActionSchema,
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

export const SessionReplayEventSchema = z.object({
  // We don't bother parsing the events themselves and instead assume that
  // rrweb will send valid data.
  events: z.array(z.unknown().transform((ev) => ev as eventWithTime)),
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

export type LocatorCheckAction = z.infer<typeof LocatorCheckActionSchema>
export type LocatorClearAction = z.infer<typeof LocatorClearActionSchema>
export type LocatorClickAction = z.infer<typeof LocatorClickActionSchema>
export type LocatorDoubleClickAction = z.infer<
  typeof LocatorDoubleClickActionSchema
>
export type LocatorFillAction = z.infer<typeof LocatorFillActionSchema>
export type LocatorFocusAction = z.infer<typeof LocatorFocusActionSchema>
export type LocatorHoverAction = z.infer<typeof LocatorHoverActionSchema>
export type LocatorPressAction = z.infer<typeof LocatorPressActionSchema>
export type LocatorSelectOptionAction = z.infer<
  typeof LocatorSelectOptionActionSchema
>
export type LocatorSetCheckedAction = z.infer<
  typeof LocatorSetCheckedActionSchema
>
export type LocatorTapAction = z.infer<typeof LocatorTapActionSchema>
export type LocatorTypeAction = z.infer<typeof LocatorTypeActionSchema>
export type LocatorUncheckAction = z.infer<typeof LocatorUncheckActionSchema>
export type LocatorWaitForAction = z.infer<typeof LocatorWaitForActionSchema>

export type GenericLocatorAction = z.infer<typeof GenericLocatorActionSchema>

export type GenericBrowserContextAction = z.infer<
  typeof GenericBrowserContextActionSchema
>

export type AnyBrowserAction = z.infer<typeof AnyBrowserActionSchema>
