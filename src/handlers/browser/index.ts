import { ipcMain, shell } from 'electron'

import { launchBrowser } from '@/browser'
import { waitForProxy } from '@/proxy'
import { browserWindowFromEvent } from '@/utils/electron'

export function initialize() {
  ipcMain.handle('browser:start', async (event, url?: string) => {
    console.info('browser:start event received')

    await waitForProxy()

    const browserWindow = browserWindowFromEvent(event)
    k6StudioState.currentBrowserProcess = await launchBrowser(
      browserWindow,
      url
    )
    console.info('browser started')
  })

  ipcMain.on('browser:stop', async () => {
    console.info('browser:stop event received')

    const { currentBrowserProcess } = k6StudioState

    if (currentBrowserProcess) {
      // macOS & windows
      if ('close' in currentBrowserProcess) {
        await currentBrowserProcess.close()
        // linux
      } else {
        currentBrowserProcess.kill()
      }

      k6StudioState.currentBrowserProcess = null
    }
  })

  ipcMain.handle('browser:open:external:link', (_, url: string) => {
    console.info('browser:open:external:link event received')
    return shell.openExternal(url)
  })
}
