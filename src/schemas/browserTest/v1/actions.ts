import { z } from 'zod/v4'

import { LocatorOptionsSchema } from '@/schemas/locator'

function safe<T>(schema: z.ZodType<T>) {
  return schema.optional().catch(undefined)
}

const ActionBaseSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
})

const GenericOptions = z.unknown()

const PageGotoActionSchema = ActionBaseSchema.extend({
  method: z.literal('page.goto'),
  url: z.string(),
  options: GenericOptions.optional(),
})

const PageReloadActionSchema = ActionBaseSchema.extend({
  method: z.literal('page.reload'),
  options: GenericOptions.optional(),
})

const PageWaitForNavigationActionSchema = ActionBaseSchema.extend({
  method: z.literal('page.waitForNavigation'),
  options: GenericOptions.optional(),
})

const PageWaitForTimeoutActionSchema = ActionBaseSchema.extend({
  method: z.literal('page.waitForTimeout'),
  // NaN is converted to null by `JSON.stringify` so we type this
  // as nullable and transform it back to NaN to allow invalid data
  // to be saved.
  timeout: z
    .number()
    .nullable()
    .transform((value) => value ?? NaN),
})

const PageCloseActionSchema = ActionBaseSchema.extend({
  method: z.literal('page.close'),
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

const LocatorClickActionSchema = ActionBaseSchema.extend({
  method: z.literal('locator.click'),
  locator: LocatorOptionsSchema,
  options: LocatorClickOptionSchema.optional(),
})

const LocatorDoubleClickActionSchema = ActionBaseSchema.extend({
  method: z.literal('locator.dblclick'),
  locator: LocatorOptionsSchema,
  options: LocatorClickOptionSchema.optional(),
})

const LocatorFillActionSchema = ActionBaseSchema.extend({
  method: z.literal('locator.fill'),
  locator: LocatorOptionsSchema,
  value: z.string(),
  options: GenericOptions.optional(),
})

const LocatorCheckActionSchema = ActionBaseSchema.extend({
  method: z.literal('locator.check'),
  locator: LocatorOptionsSchema,
  options: GenericOptions.optional(),
})

const LocatorUncheckActionSchema = ActionBaseSchema.extend({
  method: z.literal('locator.uncheck'),
  locator: LocatorOptionsSchema,
  options: GenericOptions.optional(),
})

const LocatorSelectOptionActionSchema = ActionBaseSchema.extend({
  method: z.literal('locator.selectOption'),
  locator: LocatorOptionsSchema,
  values: z.array(
    z.object({
      value: z.string().optional(),
      label: z.string().optional(),
      index: z.number().optional(),
    })
  ),
  options: GenericOptions.optional(),
})

const LocatorWaitForActionSchema = ActionBaseSchema.extend({
  method: z.literal('locator.waitFor'),
  locator: LocatorOptionsSchema,
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

const LocatorHoverActionSchema = ActionBaseSchema.extend({
  method: z.literal('locator.hover'),
  locator: LocatorOptionsSchema,
  options: GenericOptions.optional(),
})

const LocatorSetCheckedActionSchema = ActionBaseSchema.extend({
  method: z.literal('locator.setChecked'),
  locator: LocatorOptionsSchema,
  checked: z.boolean(),
  options: GenericOptions.optional(),
})

const LocatorTypeActionSchema = ActionBaseSchema.extend({
  method: z.literal('locator.type'),
  locator: LocatorOptionsSchema,
  text: z.string(),
  options: GenericOptions.optional(),
})

const LocatorPressActionSchema = ActionBaseSchema.extend({
  method: z.literal('locator.press'),
  locator: LocatorOptionsSchema,
  key: z.string(),
  options: GenericOptions.optional(),
})

const LocatorClearActionSchema = ActionBaseSchema.extend({
  method: z.literal('locator.clear'),
  locator: LocatorOptionsSchema,
  options: GenericOptions.optional(),
})

const LocatorTapActionSchema = ActionBaseSchema.extend({
  method: z.literal('locator.tap'),
  locator: LocatorOptionsSchema,
  options: GenericOptions.optional(),
})

const LocatorFocusActionSchema = ActionBaseSchema.extend({
  method: z.literal('locator.focus'),
  locator: LocatorOptionsSchema,
  options: GenericOptions.optional(),
})

const LocatorToBeCheckedActionSchema = ActionBaseSchema.extend({
  method: z.literal('locator.toBeChecked'),
  locator: LocatorOptionsSchema,
  checked: z.boolean(),
  options: GenericOptions.optional(),
})

const LocatorToBeVisibleActionSchema = ActionBaseSchema.extend({
  method: z.literal('locator.toBeVisible'),
  locator: LocatorOptionsSchema,
  visible: z.boolean(),
  options: GenericOptions.optional(),
})

const LocatorToContainTextActionSchema = ActionBaseSchema.extend({
  method: z.literal('locator.toContainText'),
  locator: LocatorOptionsSchema,
  expected: z.string(),
  options: GenericOptions.optional(),
})

export const AnyBrowserActionSchema = z.discriminatedUnion('method', [
  // Page actions
  PageGotoActionSchema,
  PageReloadActionSchema,
  PageWaitForNavigationActionSchema,
  PageWaitForTimeoutActionSchema,
  PageCloseActionSchema,

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
  LocatorToBeCheckedActionSchema,
  LocatorToBeVisibleActionSchema,
  LocatorToContainTextActionSchema,
  LocatorTypeActionSchema,
  LocatorUncheckActionSchema,
  LocatorWaitForActionSchema,
])

export type PageGotoAction = z.infer<typeof PageGotoActionSchema>
export type PageReloadAction = z.infer<typeof PageReloadActionSchema>
export type PageWaitForNavigationAction = z.infer<
  typeof PageWaitForNavigationActionSchema
>
export type PageWaitForTimeoutAction = z.infer<
  typeof PageWaitForTimeoutActionSchema
>

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
export type LocatorToBeCheckedAction = z.infer<
  typeof LocatorToBeCheckedActionSchema
>
export type LocatorToBeVisibleAction = z.infer<
  typeof LocatorToBeVisibleActionSchema
>
export type LocatorToContainTextAction = z.infer<
  typeof LocatorToContainTextActionSchema
>
export type LocatorTypeAction = z.infer<typeof LocatorTypeActionSchema>
export type LocatorUncheckAction = z.infer<typeof LocatorUncheckActionSchema>
export type LocatorWaitForAction = z.infer<typeof LocatorWaitForActionSchema>

export type AnyBrowserAction = z.infer<typeof AnyBrowserActionSchema>
