import { z } from 'zod'

import {
  CssLocatorSchema,
  GenericBrowserContextActionSchema,
  GenericLocatorActionSchema,
  GenericPageActionSchema,
  GetByAltTextLocatorSchema,
  GetByLabelLocatorSchema,
  GetByPlaceholderLocatorSchema,
  GetByRoleLocatorSchema,
  GetByTestIdLocatorSchema,
  GetByTextLocatorSchema,
  GetByTitleLocatorSchema,
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
  PageCloseActionSchema,
  PageGotoActionSchema,
  PageReloadActionSchema,
  PageWaitForNavigationActionSchema,
} from '@/main/runner/schema'

export type {
  ActionLocator,
  LocatorSelectOptionAction,
  LocatorWaitForAction,
} from '@/main/runner/schema'

const ActionLocatorTypeSchema = z.enum([
  'css',
  'role',
  'testid',
  'alt',
  'label',
  'placeholder',
  'title',
  'text',
])

const LocatorValuesSchema = z.object({
  css: CssLocatorSchema.optional(),
  role: GetByRoleLocatorSchema.optional(),
  testid: GetByTestIdLocatorSchema.optional(),
  alt: GetByAltTextLocatorSchema.optional(),
  label: GetByLabelLocatorSchema.optional(),
  placeholder: GetByPlaceholderLocatorSchema.optional(),
  title: GetByTitleLocatorSchema.optional(),
  text: GetByTextLocatorSchema.optional(),
})

export const LocatorOptionsSchema = z.object({
  current: ActionLocatorTypeSchema,
  values: LocatorValuesSchema,
})

export type LocatorOptions = z.infer<typeof LocatorOptionsSchema>

const locatorOptions = { locator: LocatorOptionsSchema }

const BrowserTestActionSchema = z.discriminatedUnion('method', [
  GenericBrowserContextActionSchema,
  PageGotoActionSchema,
  PageReloadActionSchema,
  PageWaitForNavigationActionSchema,
  PageCloseActionSchema,
  GenericPageActionSchema,

  // Locator actions need to be extended with locator options
  LocatorCheckActionSchema.extend(locatorOptions),
  LocatorClearActionSchema.extend(locatorOptions),
  LocatorClickActionSchema.extend(locatorOptions),
  LocatorDoubleClickActionSchema.extend(locatorOptions),
  LocatorFillActionSchema.extend(locatorOptions),
  LocatorFocusActionSchema.extend(locatorOptions),
  LocatorHoverActionSchema.extend(locatorOptions),
  LocatorPressActionSchema.extend(locatorOptions),
  LocatorSelectOptionActionSchema.extend(locatorOptions),
  LocatorSetCheckedActionSchema.extend(locatorOptions),
  LocatorTapActionSchema.extend(locatorOptions),
  LocatorTypeActionSchema.extend(locatorOptions),
  LocatorUncheckActionSchema.extend(locatorOptions),
  LocatorWaitForActionSchema.extend(locatorOptions),
  GenericLocatorActionSchema.extend(locatorOptions),
])

export type BrowserTestAction = z.infer<typeof BrowserTestActionSchema>

export const BrowserTestFileSchema = z.object({
  version: z.literal('1.0'),
  actions: BrowserTestActionSchema.array(),
})

export type BrowserTestFile = z.infer<typeof BrowserTestFileSchema>
