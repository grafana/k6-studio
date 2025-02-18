import { z } from 'zod'
import * as v1 from './v1'

const AnyProfileSchema = z.discriminatedUnion('version', [v1.ProfileSchema])

function migrate(profile: v1.Profile) {
  return profile
}

export const ProfileSchema = AnyProfileSchema.transform(migrate)

export { Profile, UserInfo } from './v1'
