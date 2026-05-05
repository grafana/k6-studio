import { z } from 'zod/v4'

import { AnyBrowserActionSchema } from './actions'

export const BrowserTestFileSchema = z.object({
  version: z.literal('1.0'),
  actions: AnyBrowserActionSchema.array(),
})

export type BrowserTestFile = z.infer<typeof BrowserTestFileSchema>

export type {
  AnyBrowserAction,
  GenericBrowserContextAction,
  GenericLocatorAction,
  GenericPageAction,
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
  LocatorTypeAction,
  LocatorUncheckAction,
  LocatorWaitForAction,
  PageGotoAction,
  PageReloadAction,
  PageWaitForNavigationAction,
  PageWaitForTimeoutAction,
} from './actions'
