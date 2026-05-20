import { ipcMain } from 'electron'

import { type AnyBrowserAction, BrowserTestFile } from '@/schemas/browserTest'
import { trackEvent } from '@/services/usageTracking'
import { UsageEventName } from '@/services/usageTracking/types'
import { writeFile } from '@/utils/fs'

import { createBrowserTest } from './create'
import { BrowserTestHandler } from './types'

export function initialize() {
  ipcMain.handle(
    BrowserTestHandler.Create,
    async (_, actions?: AnyBrowserAction[]) => {
      console.info(`${BrowserTestHandler.Create} event received`)

      return createBrowserTest(actions)
    }
  )

  ipcMain.handle(
    BrowserTestHandler.Save,
    async (_, filePath: string, data: BrowserTestFile) => {
      console.info(`${BrowserTestHandler.Save} event received`)

      await writeFile(filePath, JSON.stringify(data, null, 2))

      trackEvent({
        event: UsageEventName.BrowserTestUpdated,
      })
    }
  )
}
