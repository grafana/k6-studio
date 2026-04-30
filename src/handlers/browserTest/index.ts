import { ipcMain } from 'electron'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'

import { K6_BROWSER_TEST_FILE_EXTENSION } from '@/constants/files'
import { BROWSER_TESTS_PATH } from '@/constants/workspace'
import {
  BrowserTestFile,
  BrowserTestFileDataSchema,
  defaultBrowserTestOptions,
} from '@/schemas/browserTest'
import { trackEvent } from '@/services/usageTracking'
import { UsageEventName } from '@/services/usageTracking/types'
import { createFileWithUniqueName } from '@/utils/fileSystem'

import { BrowserTestHandler } from './types'

export function initialize() {
  ipcMain.handle(BrowserTestHandler.Create, async () => {
    console.info(`${BrowserTestHandler.Create} event received`)

    const emptyBrowserTest: BrowserTestFile = {
      version: '2.0',
      actions: [],
      settings: defaultBrowserTestOptions,
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

  ipcMain.handle(BrowserTestHandler.Open, async (_, fileName: string) => {
    console.info(`${BrowserTestHandler.Open} event received`)

    const data = await readFile(path.join(BROWSER_TESTS_PATH, fileName), {
      encoding: 'utf-8',
      flag: 'r',
    })

    return BrowserTestFileDataSchema.parse(JSON.parse(data))
  })

  ipcMain.handle(
    BrowserTestHandler.Save,
    async (_, fileName: string, data: BrowserTestFile) => {
      console.info(`${BrowserTestHandler.Save} event received`)

      await writeFile(
        path.join(BROWSER_TESTS_PATH, fileName),
        JSON.stringify(data, null, 2)
      )

      trackEvent({
        event: UsageEventName.BrowserTestUpdated,
      })
    }
  )
}
