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
    upstream: z.object({
      url: z.string().url({ message: 'Invalid URL' }).or(z.literal('')),
      requireAuth: z.boolean(),
      username: z.string().optional(),
      password: z.string().optional(),
    }),
  })
  .superRefine(({ mode, upstream }, ctx) => {
    // upstream.url is required when mode is 'upstream'
    if (mode === 'upstream' && !upstream.url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Upstream server is required',
        path: ['upstream.url'],
      })
    }

    // upstream.username is required when upstream.requireAuth is true
    if (mode === 'upstream' && upstream.requireAuth && !upstream.username) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Username is required',
        path: ['upstream.username'],
      })
    }

    // upstream.password is required when upstream.requireAuth is true
    if (mode === 'upstream' && upstream.requireAuth && !upstream.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password is required',
        path: ['upstream.password'],
      })
    }
  })

export const RecorderSettingsSchema = z
  .object({
    detectBrowserPath: z.boolean(),
    browserPath: z.string().optional(),
  })
  .superRefine(({ detectBrowserPath, browserPath }, ctx) => {
    // browserPath is required when detectBrowserPath is false
    if (!detectBrowserPath && !browserPath) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Browser path is required',
        path: ['browserPath'],
      })
    }
  })

export const AppSettingsSchema = z.object({
  version: z.string(),
  proxy: ProxySettingsSchema,
  recorder: RecorderSettingsSchema,
})

export type AppSettings = z.infer<typeof AppSettingsSchema>
export type ProxySettings = z.infer<typeof ProxySettingsSchema>
