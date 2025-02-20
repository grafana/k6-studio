import { z } from 'zod'

const UserInfoSchema = z.object({
  name: z.string().nullable(),
  email: z.string(),
})

const StackInfoSchema = z.object({
  id: z.string(),
  url: z.string(),
  name: z.string(),
  user: UserInfoSchema,
})

const UserProfilesSchema = z.object({
  currentStack: z.string(),
  stacks: z.record(StackInfoSchema),
})

export const ProfileSchema = z.object({
  version: z.literal('1.0'),
  tokens: z.record(z.string()),
  profiles: UserProfilesSchema,
})

export type UserInfo = z.infer<typeof UserInfoSchema>
export type StackInfo = z.infer<typeof StackInfoSchema>
export type UserProfiles = z.infer<typeof UserProfilesSchema>
export type Profile = z.infer<typeof ProfileSchema>
