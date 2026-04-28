import { EventType, type eventWithTime } from '@rrweb/types'
import { z } from 'zod/v4'

import { ElementLocatorSchema } from '@/schemas/locator'

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

const PageWaitForTimeoutActionSchema = z.object({
  method: z.literal('page.waitForTimeout'),
  // NaN is converted to null by `JSON.stringify` so we type this
  // as nullable and transform it back to NaN to allow invalid data
  // to be saved.
  timeout: z
    .number()
    .nullable()
    .transform((value) => value ?? NaN),
})

const PageCloseActionSchema = z.object({
  method: z.literal('page.close'),
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
    waitForNavigation: safe(z.boolean()),
  })
  .passthrough()

const LocatorClickActionSchema = z.object({
  method: z.literal('locator.click'),
  locator: ElementLocatorSchema,
  options: LocatorClickOptionSchema.optional(),
})

const LocatorDoubleClickActionSchema = z.object({
  method: z.literal('locator.dblclick'),
  locator: ElementLocatorSchema,
  options: LocatorClickOptionSchema.optional(),
})

const LocatorFillActionSchema = z.object({
  method: z.literal('locator.fill'),
  locator: ElementLocatorSchema,
  value: z.string(),
  options: GenericOptions.optional(),
})

const LocatorCheckActionSchema = z.object({
  method: z.literal('locator.check'),
  locator: ElementLocatorSchema,
  options: GenericOptions.optional(),
})

const LocatorUncheckActionSchema = z.object({
  method: z.literal('locator.uncheck'),
  locator: ElementLocatorSchema,
  options: GenericOptions.optional(),
})

const LocatorSelectOptionActionSchema = z.object({
  method: z.literal('locator.selectOption'),
  locator: ElementLocatorSchema,
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
  locator: ElementLocatorSchema,
  options: z
    .object({
      state: z
        .union([
          z.literal('attached'),
          z.literal('detached'),
          z.literal('visible'),
          z.literal('hidden'),
        ])
        .optional(),
      timeout: z.number().optional(),
    })
    .optional(),
})

const LocatorHoverActionSchema = z.object({
  method: z.literal('locator.hover'),
  locator: ElementLocatorSchema,
  options: GenericOptions.optional(),
})

const LocatorSetCheckedActionSchema = z.object({
  method: z.literal('locator.setChecked'),
  locator: ElementLocatorSchema,
  checked: z.boolean(),
  options: GenericOptions.optional(),
})

const LocatorTypeActionSchema = z.object({
  method: z.literal('locator.type'),
  locator: ElementLocatorSchema,
  text: z.string(),
  options: GenericOptions.optional(),
})

const LocatorPressActionSchema = z.object({
  method: z.literal('locator.press'),
  locator: ElementLocatorSchema,
  key: z.string(),
  options: GenericOptions.optional(),
})

const LocatorClearActionSchema = z.object({
  method: z.literal('locator.clear'),
  locator: ElementLocatorSchema,
  options: GenericOptions.optional(),
})

const LocatorTapActionSchema = z.object({
  method: z.literal('locator.tap'),
  locator: ElementLocatorSchema,
  options: GenericOptions.optional(),
})

const LocatorFocusActionSchema = z.object({
  method: z.literal('locator.focus'),
  locator: ElementLocatorSchema,
  options: GenericOptions.optional(),
})

const GenericLocatorActionSchema = z.object({
  method: z.literal('locator.*'),
  name: z.string(),
  locator: ElementLocatorSchema,
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
  PageWaitForTimeoutActionSchema,
  PageCloseActionSchema,
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
    ended: z.undefined().optional(),
  }),
  result: z.undefined().optional(),
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
  events: z.array(
    // Check the basic structure of events, but don't bother parsing them fully. We
    // assume that rrweb will send well-formed events.
    z
      .object({
        type: z.nativeEnum(EventType),
        timestamp: z.number(),
      })
      .passthrough()
      .transform((ev) => ev as BrowserReplayEvent)
  ),
})

export const BrowserActionEventSchema = z.discriminatedUnion('type', [
  ActionBeginEventSchema,
  ActionEndEventSchema,
])

export type ActionBeginEvent = z.infer<typeof ActionBeginEventSchema>
export type ActionEndEvent = z.infer<typeof ActionEndEventSchema>

export type BrowserActionEvent = z.infer<typeof BrowserActionEventSchema>
export type BrowserReplayEvent = eventWithTime

export type ActionResult = z.infer<typeof ActionResult>

export type PageGotoAction = z.infer<typeof PageGotoActionSchema>
export type PageReloadAction = z.infer<typeof PageReloadActionSchema>
export type PageWaitForNavigationAction = z.infer<
  typeof PageWaitForNavigationActionSchema
>
export type PageWaitForTimeoutAction = z.infer<
  typeof PageWaitForTimeoutActionSchema
>
export type GenericPageAction = z.infer<typeof GenericPageActionSchema>

export type LocatorCheckAction = z.infer<typeof LocatorCheckActionSchema>
export type LocatorClearAction = z.infer<typeof LocatorClearActionSchema>
export type LocatorClickAction = z.infer<typeof LocatorClickActionSchema>

export type LocatorClickButton = NonNullable<
  NonNullable<LocatorClickAction['options']>['button']
>

export type LocatorClickModifier = NonNullable<
  NonNullable<LocatorClickAction['options']>['modifiers']
>[number]
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
