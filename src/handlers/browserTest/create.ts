import { K6_BROWSER_TEST_FILE_EXTENSION } from '@/constants/files'
import { BROWSER_TESTS_PATH } from '@/constants/workspace'
import {
  type AnyBrowserAction,
  BrowserTestFile,
  defaultBrowserTestOptions,
} from '@/schemas/browserTest'
import { trackEvent } from '@/services/usageTracking'
import { UsageEventName } from '@/services/usageTracking/types'
import { createFileWithUniqueName } from '@/utils/fs'

export async function createBrowserTest(
  actions?: AnyBrowserAction[]
): Promise<string> {
  const browserTest: BrowserTestFile = {
    version: '1.0',
    actions: actions ?? [],
    options: defaultBrowserTestOptions,
  }

  const filePath = await createFileWithUniqueName({
    data: JSON.stringify(browserTest, null, 2),
    directory: BROWSER_TESTS_PATH,
    ext: K6_BROWSER_TEST_FILE_EXTENSION,
    prefix: 'Browser',
  })

  trackEvent({ event: UsageEventName.BrowserTestCreated })

  return filePath
}
