import { z } from 'zod'

import { jsonCodec, migrationCodec } from '@/utils/zod'

import { BrowserTestFileSchema } from './v1'

const AnyBrowserTestFileSchema = z.discriminatedUnion('version', [
  BrowserTestFileSchema,
])

export const BrowserTestFileCodec = jsonCodec(
  migrationCodec(
    AnyBrowserTestFileSchema,
    BrowserTestFileSchema,
    (supported) => {
      return supported
    }
  )
)

export {
  type BrowserTestFile,
  type AnyBrowserAction,
  type LocatorCheckAction,
  type LocatorClearAction,
  type LocatorClickAction,
  type LocatorClickButton,
  type LocatorClickModifier,
  type LocatorDoubleClickAction,
  type LocatorFillAction,
  type LocatorFocusAction,
  type LocatorHoverAction,
  type LocatorPressAction,
  type LocatorSelectOptionAction,
  type LocatorSetCheckedAction,
  type LocatorTapAction,
  type LocatorToBeCheckedAction,
  type LocatorToHaveValueAction,
  type LocatorToBeVisibleAction,
  type LocatorToContainTextAction,
  type LocatorTypeAction,
  type LocatorUncheckAction,
  type LocatorWaitForAction,
  type PageGotoAction,
  type PageReloadAction,
  type PageWaitForNavigationAction,
  type PageWaitForTimeoutAction,
} from './v1'

export * from './v1/testOptions'
