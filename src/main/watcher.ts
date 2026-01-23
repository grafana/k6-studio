import { watch } from 'chokidar'
import { BrowserWindow } from 'electron'

import { TEMP_SCRIPT_SUFFIX, PROJECT_PATH } from '@/constants/workspace'
import { UIHandler } from '@/handlers/ui/types'

import { getStudioFileFromPath } from './file'

export function configureWatcher(browserWindow: BrowserWindow) {
  k6StudioState.watcher = watch(PROJECT_PATH, {
    ignoreInitial: true,
  })

  k6StudioState.watcher.on('add', (filePath) => {
    const file = getStudioFileFromPath(filePath)

    if (!file || filePath.endsWith(TEMP_SCRIPT_SUFFIX)) {
      return
    }

    browserWindow.webContents.send(UIHandler.AddFile, file)
  })

  k6StudioState.watcher.on('unlink', (filePath) => {
    const file = getStudioFileFromPath(filePath)

    if (!file || filePath.endsWith(TEMP_SCRIPT_SUFFIX)) {
      return
    }

    browserWindow.webContents.send(UIHandler.RemoveFile, file)
  })
}

export async function closeWatcher() {
  // stop watching files to avoid crash on exit
  if (k6StudioState.watcher) {
    await k6StudioState.watcher.close()
  }
}
