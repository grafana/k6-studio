import { app, dialog, shell } from 'electron'
import log from 'electron-log/main'
import { readdirSync } from 'fs'

import { getPlatform } from '@/utils/electron'
import { exhaustive, isNodeJsErrnoException } from '@/utils/typescript'

export function checkDocumentsAccess(): 'granted' | 'denied' | 'unknown' {
  const docsPath = app.getPath('documents')

  try {
    readdirSync(docsPath)
    return 'granted'
  } catch (error) {
    if (
      isNodeJsErrnoException(error) &&
      (error.code === 'EPERM' || error.code === 'EACCES')
    ) {
      return 'denied'
    }

    log.error('Unexpected error while checking Documents access:', error)
    return 'unknown'
  }
}

async function openPermissionsSettings() {
  const platform = getPlatform()
  switch (platform) {
    case 'mac':
      await shell.openExternal(
        'x-apple.systempreferences:com.apple.preference.security?Privacy_FilesAndFolders'
      )
      break
    case 'win':
      await shell.openExternal('ms-settings:privacy-documents')
      break
    case 'linux':
      await dialog.showMessageBox({
        type: 'info',
        title: 'Open System Settings',
        message: 'Open your system settings manually.',
        detail:
          'Look for Privacy or Permissions settings and grant file access to Grafana k6 Studio.',
      })
      break
    default:
      exhaustive(platform)
  }
}

export async function verifyDocumentsAccess(): Promise<boolean> {
  const accessStatus = checkDocumentsAccess()
  const platform = getPlatform()

  // Only show our custom dialog if access was explicitly denied
  // If it's 'unknown', let the OS handle the permission prompt naturally
  if (accessStatus === 'denied') {
    let detailMessage = ''
    switch (platform) {
      case 'mac':
        detailMessage =
          'Grant Documents folder access in System Settings → Privacy & Security → Files and Folders.'
        break
      case 'win':
        detailMessage =
          'Grant file system access in Settings → Privacy → File system.'
        break
      case 'linux':
        detailMessage = 'Grant file access permissions in your system settings.'
        break
      default:
        exhaustive(platform)
    }

    const response = await dialog.showMessageBox({
      type: 'warning',
      title: 'Documents Folder Access Required',
      message:
        'Grafana k6 Studio needs access to your Documents folder to store files.',
      detail: detailMessage,
      buttons: ['Open System Settings', 'Quit'],
      defaultId: 0,
      cancelId: 1,
    })

    if (response.response === 0) {
      await openPermissionsSettings()
    }

    return false
  }

  // If access is granted or unknown (OS will handle), return true
  return true
}
