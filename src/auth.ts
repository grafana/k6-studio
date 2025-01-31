import { app, BrowserWindow, ipcMain, safeStorage, shell } from 'electron'
import { CloudProfile, UserProfile } from './schemas/profile'
import { authenticate } from './services/grafana'
import path from 'path'
import { writeFile, readFile, rm } from 'fs/promises'

const fileName =
  process.env.NODE_ENV === 'development'
    ? 'k6-studio-profile-dev.json'
    : 'k6-studio-profile.json'

const filePath = path.join(app.getPath('userData'), fileName)

export function initAuth(browserWindow: BrowserWindow) {
  ipcMain.handle('auth:get-profile', async (): Promise<UserProfile> => {
    try {
      const file = await readFile(filePath, 'utf-8')

      const { profile } = JSON.parse(file) as {
        token: string
        profile: CloudProfile
      }

      return profile
    } catch {
      return {
        type: 'anonymous',
      }
    }
  })

  let pending: AbortController | null = null

  ipcMain.handle('auth:sign-in', async () => {
    pending = new AbortController()

    const [token, profile] = await authenticate(
      pending.signal,
      async (verificationUrl, code) => {
        await shell.openExternal(verificationUrl)

        browserWindow.webContents.send('auth:user-code', code)
      }
    )

    const encryptedToken = safeStorage.encryptString(token).toString('base64')

    await writeFile(
      filePath,
      JSON.stringify({
        token: encryptedToken,
        profile,
      })
    )

    return profile
  })

  ipcMain.handle('auth:abort', () => {
    pending?.abort()
  })

  ipcMain.handle('auth:sign-out', async (): Promise<UserProfile> => {
    try {
      await rm(filePath)
    } catch {
      // If it's not there, then we're already signed out.
    }

    return {
      type: 'anonymous',
    }
  })
}
