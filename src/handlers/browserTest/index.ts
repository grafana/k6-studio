import { ipcMain } from 'electron'
import path from 'path'
import { z } from 'zod'

import { K6_BROWSER_TEST_FILE_EXTENSION } from '@/constants/files'
import { BrowserTestFileSchema } from '@/schemas/browserTest/v1'
import { trackEvent } from '@/services/usageTracking'
import { UsageEventName } from '@/services/usageTracking/types'
import { browserWindowFromEvent } from '@/utils/electron'
import { createFileWithUniqueName } from '@/utils/fileSystem'

import { BrowserTestHandler } from './types'

export function initialize() {
  ipcMain.handle(BrowserTestHandler.Create, async (event) => {
    console.info(`${BrowserTestHandler.Create} event received`)

    const browserWindow = browserWindowFromEvent(event)

    const emptyBrowserTest: z.infer<typeof BrowserTestFileSchema> = {
      version: '1.0',
      actions: [],
    }

    const fileName = await createFileWithUniqueName({
      data: JSON.stringify(emptyBrowserTest, null, 2),
      directory: browserWindow.workspace.paths.browserTests,
      ext: K6_BROWSER_TEST_FILE_EXTENSION,
      prefix: 'Browser',
    })

    trackEvent({
      event: UsageEventName.BrowserTestCreated,
    })

    return path.join(browserWindow.workspace.paths.browserTests, fileName)
  })
}
