import { ipcMain } from 'electron'

import { K6_BROWSER_TEST_FILE_EXTENSION } from '@/constants/files'
import { BROWSER_TESTS_PATH } from '@/constants/workspace'
import {
  type AnyBrowserAction,
  BrowserTestFile,
  BrowserTestFileDataSchema,
  defaultBrowserTestOptions,
} from '@/schemas/browserTest'
import { trackEvent } from '@/services/usageTracking'
import { UsageEventName } from '@/services/usageTracking/types'
import { createFileWithUniqueName, readFile, writeFile } from '@/utils/fs'
import * as path from '@/utils/path'

import { BrowserTestHandler } from './types'

export function initialize() {
  ipcMain.handle(
    BrowserTestHandler.Create,
    async (_, actions?: AnyBrowserAction[]) => {
      console.info(`${BrowserTestHandler.Create} event received`)

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

      trackEvent({
        event: UsageEventName.BrowserTestCreated,
      })

      return filePath
    }
  )

  ipcMain.handle(BrowserTestHandler.Open, async (_, filePath: string) => {
    console.info(`${BrowserTestHandler.Open} event received`)

    const resolvedPath = path.ensureWithinDirectory(
      BROWSER_TESTS_PATH,
      filePath
    )

    const data = await readFile(resolvedPath, {
      encoding: 'utf-8',
      flag: 'r',
    })

    return BrowserTestFileDataSchema.parse(JSON.parse(data))
  })

  ipcMain.handle(
    BrowserTestHandler.Save,
    async (_, filePath: string, data: BrowserTestFile) => {
      console.info(`${BrowserTestHandler.Save} event received`)

      const resolvedPath = path.ensureWithinDirectory(
        BROWSER_TESTS_PATH,
        filePath
      )

      await writeFile(resolvedPath, JSON.stringify(data, null, 2))

      trackEvent({
        event: UsageEventName.BrowserTestUpdated,
      })
    }
  )
}
