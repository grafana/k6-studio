import { z } from 'zod'

import { AnyBrowserActionSchema } from './actions'
import { BrowserTestOptionsSchema } from './testOptions'

export const BrowserTestFileSchema = z.object({
  version: z.literal('1.0'),
  actions: AnyBrowserActionSchema.array(),
  options: BrowserTestOptionsSchema,
})

export type BrowserTestFile = z.infer<typeof BrowserTestFileSchema>

export type {
  AnyBrowserAction,
  LocatorCheckAction,
  LocatorClearAction,
  LocatorClickAction,
  LocatorClickButton,
  LocatorClickModifier,
  LocatorDoubleClickAction,
  LocatorFillAction,
  LocatorFocusAction,
  LocatorHoverAction,
  LocatorPressAction,
  LocatorSelectOptionAction,
  LocatorSetCheckedAction,
  LocatorTapAction,
  LocatorToBeCheckedAction,
  LocatorToHaveValueAction,
  LocatorToBeVisibleAction,
  LocatorTypeAction,
  LocatorUncheckAction,
  LocatorWaitForAction,
  PageGotoAction,
  PageReloadAction,
  PageWaitForNavigationAction,
  PageWaitForTimeoutAction,
} from './actions'

export * from './testOptions'
