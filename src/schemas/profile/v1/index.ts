import { z } from 'zod'

export const UserInfoSchema = z.object({
  name: z.string().nullable(),
  email: z.string(),
  currentStack: z.string(),
  stacks: z.record(
    z.object({
      id: z.string(),
      name: z.string(),
      url: z.string(),
    })
  ),
})

export const ProfileSchema = z.object({
  version: z.literal('1.0'),
  tokens: z.record(z.string()),
  user: UserInfoSchema,
})

export type UserInfo = z.infer<typeof UserInfoSchema>
export type Profile = z.infer<typeof ProfileSchema>
