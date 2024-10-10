import { z } from 'zod'

export const ProxySettingsSchema = z
  .object({
    mode: z.enum(['regular', 'upstream']),
    port: z.number().int().min(1).max(65535),
    findPort: z.boolean(),
    upstream: z.string().url(),
  })
  .refine(({ mode, upstream }) => {
    // upstream is required when mode is 'upstream'
    if (mode === 'upstream' && !upstream) return false

    return true
  })

export const AppSettingsSchema = z.object({
  proxy: ProxySettingsSchema,
})

export type AppSettings = z.infer<typeof AppSettingsSchema>
export type ProxySettings = z.infer<typeof ProxySettingsSchema>
