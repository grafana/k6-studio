import { app, BrowserWindow, nativeImage, WebContents } from 'electron'
import net from 'net'
import { platform, arch } from 'os'
import path from 'path'

import { Arch, Platform } from '@/types/electron'
import { AddToastPayload } from '@/types/toast'

import { UIHandler } from '../handlers/ui/types'

export function getPlatform(): Platform {
  switch (platform()) {
    case 'aix':
    case 'freebsd':
    case 'linux':
    case 'openbsd':
    case 'android':
      return 'linux'
    case 'darwin':
    case 'sunos':
      return 'mac'
    case 'win32':
      return 'win'
    default:
      throw new Error('unsupported platform')
  }
}

// note: the os.arch() returns the architecture for which the node runtime got compiled for, this could
// be wrong for our use case since we want to fish binaries for specific architectures we are building for.
// TODO: validate behaviour
export function getArch(): Arch {
  switch (arch()) {
    case 'arm64':
      return 'arm64'
    case 'x64':
      return 'x86_64'
    default:
      throw new Error('unsupported arch')
  }
}

/**
 * Show a toast in React
 */
export function sendToast(webContents: WebContents, toast: AddToastPayload) {
  webContents.send(UIHandler.Toast, toast)
}

export const findOpenPort = (startPort: number = 3000): Promise<number> => {
  return new Promise((resolve, reject) => {
    const server = net.createServer()

    server.listen(startPort, () => {
      server.once('close', () => resolve(startPort))
      server.close()
    })

    server.on('error', () => {
      findOpenPort(startPort + 1)
        .then(resolve)
        .catch(reject)
    })
  })
}

export function getAppIcon(isDev: boolean) {
  const iconPath = isDev
    ? path.join(app.getAppPath(), 'resources', 'icons', 'logo.png')
    : path.join(process.resourcesPath, 'icons', 'logo.png')

  return nativeImage.createFromPath(iconPath)
}

export const browserWindowFromEvent = (
  event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent
) => {
  const browserWindow = BrowserWindow.fromWebContents(event.sender)

  if (!browserWindow) {
    throw new Error('failed to obtain browserWindow')
  }

  return browserWindow
}
