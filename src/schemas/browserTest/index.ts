import { z } from 'zod'

import { jsonCodec, migrationCodec } from '@/utils/zod'

import { BrowserTestFileSchema } from './v1'
import { migrateBrowserTestFile } from './v1/migration'

// Lenient schema that accepts both old (pre-recursive-locator) and new format
// files. The actual shape normalization happens in `migrateBrowserTestFile`.
const LenientBrowserTestFileSchema = z.object({
  version: z.literal('1.0'),
  actions: z.array(z.record(z.string(), z.unknown())),
  options: z.record(z.string(), z.unknown()),
})

type LenientBrowserTestFile = z.infer<typeof LenientBrowserTestFileSchema>

const AnyBrowserTestFileSchema = z.discriminatedUnion('version', [
  LenientBrowserTestFileSchema,
])

export const BrowserTestFileCodec = jsonCodec(
  migrationCodec(
    AnyBrowserTestFileSchema,
    BrowserTestFileSchema,
    (supported: LenientBrowserTestFile) => {
      const migrated = migrateBrowserTestFile(supported)
      return BrowserTestFileSchema.parse(migrated)
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
