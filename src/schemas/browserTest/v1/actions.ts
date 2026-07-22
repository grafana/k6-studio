import { z } from 'zod/v4'

import { LocatorOptionsSchema } from '@/schemas/locator'

function safe<T>(schema: z.ZodType<T>) {
  return schema.optional().catch(undefined)
}

const ActionBaseSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
})

// Shared base for actions that target an element via a locator. `frames` is the
// chain of iframe locators from the top frame down to the frame the element
// lives in, outermost first. Absent or empty means the top frame.
const LocatorActionBaseSchema = ActionBaseSchema.extend({
  locator: LocatorOptionsSchema,
  frames: LocatorOptionsSchema.array().optional(),
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

const LocatorClickActionSchema = LocatorActionBaseSchema.extend({
  method: z.literal('locator.click'),
  options: LocatorClickOptionSchema.optional(),
})

const LocatorDoubleClickActionSchema = LocatorActionBaseSchema.extend({
  method: z.literal('locator.dblclick'),
  options: LocatorClickOptionSchema.optional(),
})

const LocatorFillActionSchema = LocatorActionBaseSchema.extend({
  method: z.literal('locator.fill'),
  value: z.string(),
  options: GenericOptions.optional(),
})

const LocatorCheckActionSchema = LocatorActionBaseSchema.extend({
  method: z.literal('locator.check'),
  options: GenericOptions.optional(),
})

const LocatorUncheckActionSchema = LocatorActionBaseSchema.extend({
  method: z.literal('locator.uncheck'),
  options: GenericOptions.optional(),
})

const LocatorSelectOptionActionSchema = LocatorActionBaseSchema.extend({
  method: z.literal('locator.selectOption'),
  values: z.array(
    z.object({
      value: z.string().optional(),
      label: z.string().optional(),
      index: z.number().optional(),
    })
  ),
  options: GenericOptions.optional(),
})

const LocatorWaitForActionSchema = LocatorActionBaseSchema.extend({
  method: z.literal('locator.waitFor'),
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

const LocatorHoverActionSchema = LocatorActionBaseSchema.extend({
  method: z.literal('locator.hover'),
  options: GenericOptions.optional(),
})

const LocatorSetCheckedActionSchema = LocatorActionBaseSchema.extend({
  method: z.literal('locator.setChecked'),
  checked: z.boolean(),
  options: GenericOptions.optional(),
})

const LocatorTypeActionSchema = LocatorActionBaseSchema.extend({
  method: z.literal('locator.type'),
  text: z.string(),
  options: GenericOptions.optional(),
})

const LocatorPressActionSchema = LocatorActionBaseSchema.extend({
  method: z.literal('locator.press'),
  key: z.string(),
  options: GenericOptions.optional(),
})

const LocatorClearActionSchema = LocatorActionBaseSchema.extend({
  method: z.literal('locator.clear'),
  options: GenericOptions.optional(),
})

const LocatorTapActionSchema = LocatorActionBaseSchema.extend({
  method: z.literal('locator.tap'),
  options: GenericOptions.optional(),
})

const LocatorFocusActionSchema = LocatorActionBaseSchema.extend({
  method: z.literal('locator.focus'),
  options: GenericOptions.optional(),
})

const LocatorToBeCheckedActionSchema = LocatorActionBaseSchema.extend({
  method: z.literal('locator.toBeChecked'),
  checked: z.boolean(),
  inputType: z
    .union([z.literal('aria'), z.literal('native')])
    .default('native'),
  options: GenericOptions.optional(),
})

const ExpectedValueSchema = z.object({
  current: z.union([z.literal('single'), z.literal('multiple')]),
  values: z.object({
    single: z.string().optional(),
    multiple: z.array(z.string()).optional(),
  }),
})

const LocatorToHaveValueActionSchema = LocatorActionBaseSchema.extend({
  method: z.literal('locator.toHaveValue'),
  expected: ExpectedValueSchema,
  options: GenericOptions.optional(),
})

const LocatorToBeVisibleActionSchema = LocatorActionBaseSchema.extend({
  method: z.literal('locator.toBeVisible'),
  visible: z.boolean(),
  options: GenericOptions.optional(),
})

const LocatorToContainTextActionSchema = LocatorActionBaseSchema.extend({
  method: z.literal('locator.toContainText'),
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
  LocatorToHaveValueActionSchema,
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
export type LocatorToHaveValueAction = z.infer<
  typeof LocatorToHaveValueActionSchema
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
