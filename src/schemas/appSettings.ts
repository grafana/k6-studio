import { z } from 'zod'

export const RegularProxySettingsSchema = z.object({
  mode: z.literal('regular'),
  port: z
    .number({ message: 'Port number is required' })
    .int()
    .min(1)
    .max(65535, { message: 'Port number must be between 1 and 65535' }),
  automaticallyFindPort: z.boolean(),
})

export const UpstreamProxySettingsSchema = RegularProxySettingsSchema.extend({
  mode: z.literal('upstream'),
  url: z.string().url({ message: 'Invalid URL' }).or(z.literal('')),
  requiresAuth: z.boolean(),
  username: z.string().optional(),
  password: z.string().optional(),
})

export const ProxySettingsSchema = z
  .discriminatedUnion('mode', [
    RegularProxySettingsSchema,
    UpstreamProxySettingsSchema,
  ])
  .superRefine((data, ctx) => {
    if (data.mode === 'upstream') {
      const { url, requiresAuth, username, password } = data

      // url is required when mode is 'upstream'
      if (!url) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Upstream server is required',
          path: ['url'],
        })
      }

      // username is required when requiresAuth is true
      if (requiresAuth && !username) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Username is required',
          path: ['username'],
        })
      }

      // password is required when requiresAuth is true
      if (requiresAuth && !password) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Password is required',
          path: ['password'],
        })
      }
    }
  })

const RecorderDetectBrowserPathSchema = z.object({
  detectBrowserPath: z.literal(true),
})

const RecorderBrowserPathSchema = RecorderDetectBrowserPathSchema.extend({
  detectBrowserPath: z.literal(false),
  browserPath: z.string().optional(),
})

export const RecorderSettingsSchema = z
  .discriminatedUnion('detectBrowserPath', [
    RecorderDetectBrowserPathSchema,
    RecorderBrowserPathSchema,
  ])
  .superRefine((data, ctx) => {
    // browserPath is required when detectBrowserPath is false
    if (!data.detectBrowserPath && !data.browserPath) {
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
