import {
  app,
  BrowserWindow,
  ipcMain,
  IpcMainEvent,
  safeStorage,
  shell,
} from 'electron'
import { CloudProfile, UserProfile } from './schemas/profile'
import { authenticate } from './services/grafana/authenticate'
import path from 'path'
import { writeFile, readFile, rm } from 'fs/promises'
import { fetchInstances } from './services/grafana'
import { fetchPersonalToken } from './services/k6'

interface WaitForDone<T> {
  status: 'done'
  data: T
}

interface WaitForAborted {
  status: 'aborted'
}

type WaitForResult<T> = WaitForDone<T> | WaitForAborted

interface WaitForOptions {
  event: string
  signal: AbortSignal
  timeout?: number
}

async function waitFor<T>({
  event,
  signal,
  timeout = Infinity,
}: WaitForOptions) {
  return new Promise<WaitForResult<T>>((resolve, reject) => {
    const handleMessage = (_: IpcMainEvent, data: T) => {
      clearTimeout(timeoutId)

      resolve({
        status: 'done',
        data,
      })
    }

    const timeoutId = setTimeout(() => {
      ipcMain.removeListener(event, handleMessage)

      reject(new Error(`Timeout waiting for "${event}"`))
    }, timeout)

    signal.addEventListener('abort', () => {
      clearTimeout(timeoutId)

      ipcMain.removeListener(event, handleMessage)

      resolve({
        status: 'aborted',
      })
    })

    ipcMain.once(event, handleMessage)
  })
}

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

    const instances = await fetchInstances(token)

    browserWindow.webContents.send('auth:instances-fetched', instances)

    const stackId = await waitFor<string>({
      event: 'auth:stack-id-selected',
      signal: pending.signal,
    })

    if (stackId.status === 'aborted') {
      return
    }

    const apiTokenResponse = await fetchPersonalToken(stackId.data, token)

    const encryptedToken = safeStorage
      .encryptString(apiTokenResponse.api_token)
      .toString('base64')

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
