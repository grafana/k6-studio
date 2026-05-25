import { app } from 'electron'
import log from 'electron-log/main'

import {
  decryptString,
  encryptString,
  isEncryptionAvailable,
} from '@/main/encryption'
import { Profile, ProfileSchema } from '@/schemas/profile'
import { readFile, writeFile } from '@/utils/fs'
import * as path from '@/utils/path'

const ENCRYPTED_PREFIX = 'enc:'

const fileName =
  process.env.NODE_ENV === 'development'
    ? 'k6-studio-profile-dev.json'
    : 'k6-studio-profile.json'

const filePath = path.join(app.getPath('userData'), fileName)

let profileDataCache: Profile | null = null

function encryptProfileTokens(profile: Profile): Profile {
  if (!isEncryptionAvailable()) {
    log.warn('Encryption unavailable, storing tokens in plaintext')
    return profile
  }

  return {
    ...profile,
    tokens: Object.fromEntries(
      Object.entries(profile.tokens).map(([stackId, token]) => [
        stackId,
        ENCRYPTED_PREFIX + encryptString(token),
      ])
    ),
  }
}

function decryptProfileTokens(profile: Profile): Profile {
  return {
    ...profile,
    tokens: Object.fromEntries(
      Object.entries(profile.tokens).flatMap(([stackId, token]) => {
        if (!token.startsWith(ENCRYPTED_PREFIX)) {
          // Plaintext token from before encryption was added
          return [[stackId, token]]
        }
        try {
          return [
            [stackId, decryptString(token.slice(ENCRYPTED_PREFIX.length))],
          ]
        } catch {
          // Encrypted with different key (e.g. profile copied between machines)
          log.warn('Failed to decrypt token for stack', stackId, '- discarding')
          return []
        }
      })
    ),
  }
}

export async function getProfileData(): Promise<Profile> {
  if (profileDataCache) {
    return profileDataCache
  }

  try {
    const file = await readFile(filePath, 'utf-8')
    const parsed = ProfileSchema.parse(JSON.parse(file))
    profileDataCache = decryptProfileTokens(parsed)

    return profileDataCache
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

export async function saveProfileData(profile: Profile) {
  try {
    const toSave = encryptProfileTokens(profile)
    await writeFile(filePath, JSON.stringify(toSave, null, 2), { mode: 0o600 })
  } finally {
    profileDataCache = null
  }
}
