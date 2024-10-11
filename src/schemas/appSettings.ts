import { z } from 'zod'

export const ProxySettingsSchema = z
  .object({
    mode: z.enum(['regular', 'upstream']),
    port: z
      .number({ message: 'Port number is required' })
      .int()
      .min(1)
      .max(65535, { message: 'Port number must be between 1 and 65535' }),
    findPort: z.boolean(),
    upstream: z.string().url({ message: 'Invalid URL' }).or(z.literal('')),
  })
  .superRefine(({ mode, upstream }, ctx) => {
    // upstream is required when mode is 'upstream'
    if (mode === 'upstream' && !upstream) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Upstream server is required',
        path: ['upstream'],
      })
    }
  })

export const AppSettingsSchema = z.object({
  proxy: ProxySettingsSchema,
})

export type AppSettings = z.infer<typeof AppSettingsSchema>
export type ProxySettings = z.infer<typeof ProxySettingsSchema>
