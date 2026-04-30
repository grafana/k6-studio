import { z } from 'zod'

import * as v2 from '../v2'

export const RegularProxySettingsSchema = z.object({
  mode: z.literal('regular'),
  port: z
    .number({ message: 'Port number is required' })
    .int()
    .min(1)
    .max(65535, { message: 'Port number must be between 1 and 65535' }),
  automaticallyFindPort: z.boolean(),
  sslInsecure: z.boolean().default(false),
})

export const UpstreamProxySettingsSchema = RegularProxySettingsSchema.extend({
  mode: z.literal('upstream'),
  url: z.string().url({ message: 'Invalid URL' }).or(z.literal('')),
  requiresAuth: z.boolean(),
  username: z.string().optional(),
  password: z.string().optional(),
  certificatePath: z.string().optional(),
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
  enableBrowserRecorder: z.boolean().default(true),
})

const RecorderBrowserPathSchema = RecorderDetectBrowserPathSchema.extend({
  detectBrowserPath: z.literal(false),
  browserPath: z.string().optional(),
})

export const UsageReportSettingsSchema = z.object({
  enabled: z.boolean(),
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

export const WindowStateSchema = z.object({
  x: z.number().int(),
  y: z.number().int(),
  width: z.number().int(),
  height: z.number().int(),
  isMaximized: z.boolean(),
})

export const AppearanceSchema = z.object({
  theme: z.union([z.literal('light'), z.literal('dark'), z.literal('system')]),
})

export const AppSettingsSchema = z.object({
  version: z.literal('1.0'),
  proxy: ProxySettingsSchema,
  recorder: RecorderSettingsSchema,
  windowState: WindowStateSchema,
  usageReport: UsageReportSettingsSchema,
  appearance: AppearanceSchema,
})

// Migrate settings to the next version
export function migrate(
  settings: z.infer<typeof AppSettingsSchema>
): v2.AppSettings {
  return {
    version: '2.0',
    proxy: settings.proxy,
    recorder: settings.recorder,
    windowState: settings.windowState,
    usageReport: settings.usageReport,
    appearance: settings.appearance,
  }
}

export type UpstreamProxySettings = z.infer<typeof UpstreamProxySettingsSchema>
export type AppSettings = z.infer<typeof AppSettingsSchema>
