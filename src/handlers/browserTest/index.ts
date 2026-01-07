import { ipcMain } from 'electron'
import { z } from 'zod'

import { K6_BROWSER_TEST_FILE_EXTENSION } from '@/constants/files'
import { BROWSER_TESTS_PATH } from '@/constants/workspace'
import { BrowserTestFileSchema } from '@/schemas/browserTest/v1'
import { trackEvent } from '@/services/usageTracking'
import { UsageEventName } from '@/services/usageTracking/types'
import { createFileWithUniqueName } from '@/utils/fileSystem'

import { BrowserTestHandler } from './types'

export function initialize() {
  ipcMain.handle(BrowserTestHandler.Create, async () => {
    console.log(`${BrowserTestHandler.Create} event received`)

    const emptyBrowserTest: z.infer<typeof BrowserTestFileSchema> = {
      version: '1.0',
      actions: [],
    }

    const fileName = await createFileWithUniqueName({
      data: JSON.stringify(emptyBrowserTest, null, 2),
      directory: BROWSER_TESTS_PATH,
      ext: K6_BROWSER_TEST_FILE_EXTENSION,
      prefix: 'Browser',
    })

    trackEvent({
      event: UsageEventName.BrowserTestCreated,
    })

    return fileName
  })
}
