import { z } from 'zod'

import { jsonCodec } from '@/utils/zod'

import { migrateBrowserTestFile } from './migration'
import { BrowserTestFileSchema } from './v1'

// Lenient input schema that accepts both old (pre-#1332) and new locator
// formats. Old files lack `type` on locator options and may have a flat
// `frames` array on actions. We parse actions loosely here and rely on the
// migration + strict schema validation to normalize.
const LenientBrowserTestFileSchema = z.looseObject({
  version: z.literal('1.0'),
  actions: z.array(z.looseObject({})),
  options: z.looseObject({}),
})

const BrowserTestMigrationCodec = z.codec(
  LenientBrowserTestFileSchema,
  BrowserTestFileSchema,
  {
    decode(value) {
      const migrated = migrateBrowserTestFile(value as never)
      return BrowserTestFileSchema.parse(migrated)
    },
    encode(value) {
      return BrowserTestFileSchema.parse(value)
    },
  }
)

export const BrowserTestFileCodec = jsonCodec(BrowserTestMigrationCodec)

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
