import { app, BrowserWindow, ipcMain, safeStorage, shell } from 'electron'
import { Profile, ProfileSchema, UserInfo } from '../schemas/profile'
import { authenticate } from '../services/grafana/authenticate'
import path from 'path'
import { writeFile, readFile, rm } from 'fs/promises'
import { fetchInstances } from '../services/grafana'
import { fetchPersonalToken } from '../services/k6'
import { SignInProcessState, SignInResult, Stack } from '../types/auth'
import log from 'electron-log/main'
import { ClientError } from 'openid-client'
import { AuthHandler } from './auth.types'
import { waitFor } from './utils'

const fileName =
  process.env.NODE_ENV === 'development'
    ? 'k6-studio-profile-dev.json'
    : 'k6-studio-profile.json'

const filePath = path.join(app.getPath('userData'), fileName)

function wasAborted(error: unknown): boolean {
  return (
    (error instanceof ClientError && error.code == 'OAUTH_ABORT') ||
    (error instanceof Error && error.name === 'AbortError')
  )
}

async function getCurrentProfile() {
  try {
    const file = await readFile(filePath, 'utf-8')

    return ProfileSchema.parse(JSON.parse(file))
  } catch {
    return null
  }
}

export function initialize(browserWindow: BrowserWindow) {
  function notifyStateChange(state: SignInProcessState) {
    browserWindow.webContents.send('auth:state-change', state)
  }

  ipcMain.handle(AuthHandler.GetUser, async (): Promise<UserInfo | null> => {
    const profile = await getCurrentProfile()

    if (profile === null) {
      return null
    }

    return profile.user
  })

  let pending: AbortController | null = null

  ipcMain.handle(AuthHandler.SignIn, async (): Promise<SignInResult> => {
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

          notifyStateChange({
            type: 'awaiting-authorization',
            code,
          })
        },
      })

      if (result.type === 'denied') {
        return {
          type: 'denied',
        }
      }

      if (result.type === 'timed-out') {
        return {
          type: 'timed-out',
        }
      }

      const currentProfile = await getCurrentProfile()

      if (
        currentProfile !== null &&
        currentProfile?.user.email !== result.email
      ) {
        return {
          type: 'conflict',
        }
      }

      notifyStateChange({
        type: 'fetching-stacks',
      })

      const instances = await fetchInstances(result.token, signal)

      notifyStateChange({
        type: 'selecting-stack',
        stacks: instances.items.map((instance) => {
          return {
            id: instance.id,
            name: instance.name,
            url: instance.url,
            archived: instance.status === 'archived',
          }
        }),
      })

      const stack = await waitFor<Stack>({
        event: AuthHandler.SelectStack,
        signal: signal,
      })

      if (stack.status === 'aborted') {
        return {
          type: 'aborted',
        }
      }

      const apiTokenResponse = await fetchPersonalToken(
        stack.data.id,
        result.token,
        signal
      )

      if (signal.aborted) {
        return {
          type: 'aborted',
        }
      }

      const encryptedToken = safeStorage
        .encryptString(apiTokenResponse.api_token)
        .toString('base64')

      const newProfile: Profile = {
        version: '1.0',
        tokens: {
          ...currentProfile?.tokens,
          [stack.data.id]: encryptedToken,
        },
        user: {
          name: null,
          email: result.email,
          currentStack: stack.data.id,
          stacks: {
            ...currentProfile?.user.stacks,
            [stack.data.id]: {
              id: stack.data.id,
              name: stack.data.name,
              url: stack.data.url,
            },
          },
        },
      }

      await writeFile(filePath, JSON.stringify(newProfile, null, 2))

      return {
        type: 'authenticated',
        user: newProfile.user,
      }
    } catch (error) {
      if (wasAborted(error)) {
        return {
          type: 'aborted',
        }
      }

      log.error('Unexpected error occurred during sign-in.', error)

      throw error
    } finally {
      pending = null
    }
  })

  ipcMain.handle(AuthHandler.Abort, () => {
    pending?.abort()
    pending = null
  })

  ipcMain.handle(AuthHandler.ChangeStack, async (_event, stackId: string) => {
    const profile = await getCurrentProfile()

    if (profile === null) {
      throw new Error('No profile found')
    }

    if (profile.user.stacks[stackId] === undefined) {
      throw new Error('Stack not found')
    }

    const newProfile: Profile = {
      ...profile,
      user: {
        ...profile.user,
        currentStack: stackId,
      },
    }

    await writeFile(filePath, JSON.stringify(newProfile, null, 2))

    return newProfile.user
  })

  ipcMain.handle(AuthHandler.SignOut, async (): Promise<void> => {
    try {
      await rm(filePath)
    } catch {
      // If it's not there, then we're already signed out.
    }
  })
}
