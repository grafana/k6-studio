import { app } from 'electron'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'

import { Profile, ProfileSchema } from '@/schemas/profile'

const fileName =
  process.env.NODE_ENV === 'development'
    ? 'k6-studio-profile-dev.json'
    : 'k6-studio-profile.json'

const filePath = path.join(app.getPath('userData'), fileName)

let profileDataCache: Profile | null = null

export async function getProfileData(): Promise<Profile> {
  if (profileDataCache) {
    return profileDataCache
  }

  try {
    const file = await readFile(filePath, 'utf-8')
    profileDataCache = ProfileSchema.parse(JSON.parse(file))

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
    await writeFile(filePath, JSON.stringify(profile, null, 2))
  } finally {
    profileDataCache = null
  }
}
