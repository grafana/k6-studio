import { app, BrowserWindow, ipcMain, safeStorage, shell } from 'electron'
import {
  UserProfiles,
  Profile,
  ProfileSchema,
  StackInfo,
} from '../schemas/profile'
import { authenticate } from '../services/grafana/authenticate'
import path from 'path'
import { writeFile, readFile } from 'fs/promises'
import { fetchStacks } from '../services/grafana'
import { fetchPersonalToken } from '../services/k6'
import {
  SelectStackResponse,
  SignInProcessState,
  SignInResult,
} from '../types/auth'
import log from 'electron-log/main'
import { ClientError } from 'openid-client'
import { AuthHandler, ChangeStackResponse, SignOutResponse } from './auth.types'
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

async function getProfileData(): Promise<Profile> {
  try {
    const file = await readFile(filePath, 'utf-8')

    return ProfileSchema.parse(JSON.parse(file))
  } catch {
    return {
      version: '1.0',
      tokens: {},
      profiles: {
        currentStack: '',
        stacks: {},
      },
    }
  }
}

export function initialize(browserWindow: BrowserWindow) {
  function notifyStateChange(state: SignInProcessState) {
    browserWindow.webContents.send('auth:state-change', state)
  }

  ipcMain.handle(AuthHandler.GetProfiles, async (): Promise<UserProfiles> => {
    const profile = await getProfileData()

    return profile.profiles
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

      let stackResponse: SelectStackResponse = {
        type: 'refresh-stacks',
        current: undefined,
      }

      while (stackResponse.type === 'refresh-stacks') {
        notifyStateChange({
          type: 'fetching-stacks',
        })

        const stacks = await fetchStacks(result.token, signal)

        // Skip having to select a stack if there's only one available.
        // We do show the step if the stack is archived though, so that
        // they get instructions on logging in to it.
        if (
          stacks.length === 1 &&
          stacks[0] &&
          stacks[0].status !== 'archived'
        ) {
          stackResponse = {
            type: 'select-stack',
            selected: stacks[0],
          }

          break
        }

        notifyStateChange({
          type: 'selecting-stack',
          current: stackResponse.current,
          stacks,
        })

        stackResponse = await waitFor<SelectStackResponse>({
          event: AuthHandler.SelectStack,
          signal: signal,
        })
      }

      const stack = stackResponse.selected

      notifyStateChange({
        type: 'fetching-token',
        stack,
      })

      const apiTokenResponse = await fetchPersonalToken(
        stack.id,
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

      const profileData = await getProfileData()

      const stackInfo: StackInfo = {
        id: stack.id,
        name: stack.name,
        url: stack.url,
        user: {
          name: null,
          email: result.email,
        },
      }

      const newProfile: Profile = {
        version: '1.0',
        tokens: {
          ...profileData.tokens,
          [stack.id]: encryptedToken,
        },
        profiles: {
          ...profileData.profiles,
          currentStack: stack.id,
          stacks: {
            ...profileData.profiles.stacks,
            [stack.id]: stackInfo,
          },
        },
      }

      await writeFile(filePath, JSON.stringify(newProfile, null, 2))

      return {
        type: 'authenticated',
        current: stackInfo,
        profiles: newProfile.profiles,
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

  ipcMain.handle(
    AuthHandler.ChangeStack,
    async (_event, stackId: string): Promise<ChangeStackResponse> => {
      const profileData = await getProfileData()

      const stack = profileData.profiles.stacks[stackId]

      if (stack === undefined) {
        throw new Error(`User has not signed in to stack with id ${stackId}.`)
      }

      const newProfile: Profile = {
        ...profileData,
        profiles: {
          ...profileData.profiles,
          currentStack: stack.id,
        },
      }

      await writeFile(filePath, JSON.stringify(newProfile, null, 2))

      return {
        current: stack,
        profiles: newProfile.profiles,
      }
    }
  )

  ipcMain.handle(
    AuthHandler.SignOut,
    async (_ev, stack: StackInfo): Promise<SignOutResponse> => {
      const profileData = await getProfileData()

      delete profileData.tokens[stack.id]
      delete profileData.profiles.stacks[stack.id]

      if (profileData.profiles.currentStack === stack.id) {
        const [firstStack] = Object.values(profileData.profiles.stacks)

        profileData.profiles.currentStack = firstStack?.id ?? ''
      }

      await writeFile(filePath, JSON.stringify(profileData, null, 2))

      return {
        current:
          profileData.profiles.stacks[profileData.profiles.currentStack] ??
          null,
        profiles: profileData.profiles,
      }
    }
  )
}
