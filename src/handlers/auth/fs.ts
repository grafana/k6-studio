import { readFile, writeFile } from 'fs/promises'
import { Profile, ProfileSchema } from '@/schemas/profile'
import path from 'path'
import { app } from 'electron'

const fileName =
  process.env.NODE_ENV === 'development'
    ? 'k6-studio-profile-dev.json'
    : 'k6-studio-profile.json'

const filePath = path.join(app.getPath('userData'), fileName)

export async function getProfileData(): Promise<Profile> {
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

export async function saveProfileData(profile: Profile) {
  await writeFile(filePath, JSON.stringify(profile, null, 2))
}
