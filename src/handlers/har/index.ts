import { ipcMain } from 'electron'
import path from 'path'

import { trackEvent } from '@/services/usageTracking'
import { UsageEventName } from '@/services/usageTracking/types'
import { RecordingData } from '@/types/recordingData'
import { browserWindowFromEvent } from '@/utils/electron'
import { createFileWithUniqueName } from '@/utils/fileSystem'
import { proxyDataToHar } from '@/utils/proxyDataToHar'

import { HarHandler } from './types'

export function initialize() {
  ipcMain.handle(
    HarHandler.SaveFile,
    async (event, data: RecordingData, prefix: string) => {
      console.info(`${HarHandler.SaveFile} event received`)

      const browserWindow = browserWindowFromEvent(event)

      const har = proxyDataToHar(data.requests, data.browserEvents)
      const fileName = await createFileWithUniqueName({
        data: JSON.stringify(har, null, 2),
        directory: browserWindow.workspace.paths.recordings,
        ext: '.har',
        prefix,
      })

      trackEvent({
        event: UsageEventName.RecordingCreated,
      })

      return path.join(browserWindow.workspace.paths.recordings, fileName)
    }
  )
}
