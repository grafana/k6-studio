import { ipcMain } from 'electron'
import log from 'electron-log/main'

import { UserProfiles, Profile, StackInfo } from '@/schemas/profile'
import { SignInResult } from '@/types/auth'
import { browserWindowFromEvent } from '@/utils/electron'

import { getProfileData, saveProfileData } from './fs'
import { SignInStateMachine } from './states'
import { AuthHandler, ChangeStackResponse, SignOutResponse } from './types'

export function initialize() {
  ipcMain.handle(AuthHandler.GetProfiles, async (): Promise<UserProfiles> => {
    const profile = await getProfileData()

    return profile.profiles
  })

  let pending: SignInStateMachine | null = null

  ipcMain.handle(AuthHandler.SignIn, async (event): Promise<SignInResult> => {
    const browserWindow = browserWindowFromEvent(event)
    try {
      if (pending !== null) {
        pending.abort()
        pending = null
      }

      pending = new SignInStateMachine()

      pending.on('state-change', (state) => {
        browserWindow.webContents.send('auth:state-change', state)
      })

      return await pending.start()
    } catch (error) {
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

      await saveProfileData(newProfile)

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

      await saveProfileData(profileData)

      return {
        current:
          profileData.profiles.stacks[profileData.profiles.currentStack] ??
          null,
        profiles: profileData.profiles,
      }
    }
  )
}
