import { z } from 'zod'

import {
  ALWAYS_MANAGED_BROWSER_SWITCHES,
  findCustomBrowserArgumentError,
} from '@/utils/browserLaunchArgs'

import {
  AppearanceSchema,
  ProxySettingsSchema,
  TelemetrySchema,
  WindowStateSchema,
  type UpstreamProxySettings,
} from '../v4'

export {
  AppearanceSchema,
  ProxySettingsSchema,
  TelemetrySchema,
  WindowStateSchema,
  type UpstreamProxySettings,
}

export const CustomBrowserLaunchArgsSchema = z
  .array(z.string())
  .transform((args) => args.map((argument) => argument.trim()).filter(Boolean))
  .superRefine((args, ctx) => {
    const message = findCustomBrowserArgumentError(
      args,
      ALWAYS_MANAGED_BROWSER_SWITCHES
    )

    if (message) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message,
      })
    }
  })

const BaseRecorderSettingsSchema = z.object({
  chromeLaunchArgs: CustomBrowserLaunchArgsSchema.optional().default([]),
})

const RecorderDetectBrowserPathSchema = BaseRecorderSettingsSchema.extend({
  detectBrowserPath: z.literal(true),
  browserRecording: z
    .union([z.literal('extension'), z.literal('cdp'), z.literal('disabled')])
    .optional(),
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
    if (!data.detectBrowserPath && !data.browserPath) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Browser path is required',
        path: ['browserPath'],
      })
    }
  })

export const AppSettingsSchema = z.object({
  version: z.literal('5.0'),
  proxy: ProxySettingsSchema,
  recorder: RecorderSettingsSchema,
  windowState: WindowStateSchema,
  telemetry: TelemetrySchema,
  appearance: AppearanceSchema,
})

export type AppSettings = z.infer<typeof AppSettingsSchema>
