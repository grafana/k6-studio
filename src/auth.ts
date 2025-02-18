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
import {
  AuthorizationDeniedState,
  AwaitingAuthorizationState,
  FetchingStacksState,
  SelectingStackState,
  TimedOutState,
} from './types/auth'
import log from 'electron-log/main'

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

async function waitFor<T>({ event, signal, timeout }: WaitForOptions) {
  return new Promise<WaitForResult<T>>((resolve, reject) => {
    const timeoutId =
      timeout &&
      setTimeout(() => {
        ipcMain.removeListener(event, handleMessage)

        reject(new Error(`Timeout waiting for "${event}"`))
      }, timeout)

    const handleAbort = () => {
      clearTimeout(timeoutId)

      ipcMain.removeListener(event, handleMessage)

      resolve({
        status: 'aborted',
      })
    }

    const handleMessage = (_: IpcMainEvent, data: T) => {
      clearTimeout(timeoutId)

      signal.removeEventListener('abort', handleAbort)

      resolve({
        status: 'done',
        data,
      })
    }

    signal.addEventListener('abort', handleAbort)

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
    try {
      if (pending !== null) {
        pending?.abort()
        pending = null
      }

      pending = new AbortController()

      const signal = pending.signal

      const result = await authenticate({
        signal,
        onUserCode: async (verificationUrl, code) => {
          await shell.openExternal(verificationUrl)

          browserWindow.webContents.send('auth:state-change', {
            type: 'awaiting-authorization',
            code,
          } satisfies AwaitingAuthorizationState)
        },
      })

      if (result.type === 'denied') {
        browserWindow.webContents.send('auth:state-change', {
          type: 'authorization-denied',
        } satisfies AuthorizationDeniedState)

        return
      }

      if (result.type === 'timed-out') {
        browserWindow.webContents.send('auth:state-change', {
          type: 'timed-out',
        } satisfies TimedOutState)

        return
      }

      browserWindow.webContents.send('auth:state-change', {
        type: 'fetching-stacks',
      } satisfies FetchingStacksState)

      const instances = await fetchInstances(result.token, signal)

      browserWindow.webContents.send('auth:state-change', {
        type: 'selecting-stack',
        stacks: instances.items.map((instance) => {
          return {
            id: instance.id,
            name: instance.name,
            url: instance.url,
            archived: instance.status === 'archived',
          }
        }),
      } satisfies SelectingStackState)

      const stack = await waitFor<string>({
        event: 'auth:select-stack',
        signal: signal,
      })

      if (stack.status === 'aborted') {
        return
      }

      const apiTokenResponse = await fetchPersonalToken(
        stack.data,
        result.token,
        signal
      )

      if (signal.aborted) {
        return
      }

      const encryptedToken = safeStorage
        .encryptString(apiTokenResponse.api_token)
        .toString('base64')

      await writeFile(
        filePath,
        JSON.stringify({
          token: encryptedToken,
          profile: result.profile,
        })
      )

      return result.profile
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }

      log.error('Unexpected error occurred during sign-in.', error)

      throw error
    } finally {
      pending = null
    }
  })

  ipcMain.handle('auth:abort', () => {
    pending?.abort()
    pending = null
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
