import { ipcMain, WebContents } from 'electron'
import log from 'electron-log/main'
import { writeFile } from 'fs/promises'
import invariant from 'tiny-invariant'

import { INVALID_FILENAME_CHARS } from '@/constants/files'
import { getFilePath } from '@/main/file'
import { trackEvent } from '@/services/usageTracking'
import { UsageEvent, UsageEventName } from '@/services/usageTracking/types'
import { browserWindowFromEvent, sendToast } from '@/utils/electron'
import { exhaustive } from '@/utils/typescript'

import { FileHandler, SaveFileContent, SaveFilePayload } from './types'

export function initialize() {
  ipcMain.handle(
    FileHandler.Save,
    async (event, { content, location }: SaveFilePayload) => {
      console.info(`${FileHandler.Save} event received`)

      const browserWindow = browserWindowFromEvent(event)

      try {
        const filePath = resolvePath(content, location)
        const serialized = serializeContent(content)

        await writeFile(filePath, serialized)

        trackSaveFile(content)
        notifySaveFile(browserWindow.webContents, content)
      } catch (error) {
        sendToast(browserWindow.webContents, {
          title: 'Failed to save the file',
          status: 'error',
        })

        log.error(error)

        throw error
      }
    }
  )
}

function resolvePath(
  content: SaveFilePayload['content'],
  location: SaveFilePayload['location']
): string {
  switch (location.type) {
    case 'path':
      return location.path

    case 'legacy': {
      invariant(
        !INVALID_FILENAME_CHARS.test(location.name),
        'Invalid file name'
      )
      return getFilePath({
        type: content.type,
        fileName: location.name,
      })
    }
    case 'new':
      throw new Error("Save with location 'new' is not implemented")

    default:
      return exhaustive(location)
  }
}

function serializeContent(content: SaveFilePayload['content']): string {
  switch (content.type) {
    case 'generator':
    case 'browser-test':
    case 'recording':
      return JSON.stringify(content.data, null, 2)

    case 'script':
      return content.content

    default:
      return exhaustive(content)
  }
}

function notifySaveFile(webContents: WebContents, content: SaveFileContent) {
  switch (content.type) {
    case 'recording':
    case 'generator':
    case 'browser-test':
      break

    case 'script':
      sendToast(webContents, {
        title: 'Script saved successfully',
        status: 'success',
      })
      break

    default:
      exhaustive(content)
  }
}

function trackSaveFile(content: SaveFileContent) {
  const trackingEvent = getTrackingEvent(content)

  if (trackingEvent === null) {
    return
  }

  trackEvent(trackingEvent)
}

function getTrackingEvent(content: SaveFileContent): UsageEvent | null {
  switch (content.type) {
    case 'generator':
      return {
        event: UsageEventName.GeneratorUpdated,
        payload: {
          rules: {
            correlation: content.data.rules.filter(
              (rule) => rule.type === 'correlation'
            ).length,
            parameterization: content.data.rules.filter(
              (rule) => rule.type === 'parameterization'
            ).length,
            verification: content.data.rules.filter(
              (rule) => rule.type === 'verification'
            ).length,
            customCode: content.data.rules.filter(
              (rule) => rule.type === 'customCode'
            ).length,
            disabled: content.data.rules.filter((rule) => !rule.enabled).length,
          },
        },
      }

    case 'browser-test':
      return {
        event: UsageEventName.BrowserTestUpdated,
      }

    case 'script':
      return {
        event: UsageEventName.ScriptExported,
      }

    case 'recording':
      return null

    default:
      return content satisfies never
  }
}
