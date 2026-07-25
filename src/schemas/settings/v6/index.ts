import { z } from 'zod'

import {
  ALWAYS_MANAGED_BROWSER_SWITCHES,
  findCustomBrowserArgumentError,
} from '@/utils/browserLaunchArgs'

import * as v5 from '../v5'

export {
  AppearanceSchema,
  ProxySettingsSchema,
  TelemetrySchema,
  WindowStateSchema,
  type UpstreamProxySettings,
} from '../v5'

export const CustomBrowserLaunchArgsSchema = z
  .array(z.string())
  .default([])
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

export const RecorderSettingsSchema = v5.RecorderSettingsSchema.and(
  z.object({
    customBrowserLaunchArgs: CustomBrowserLaunchArgsSchema,
  })
)

export const AppSettingsSchema = v5.AppSettingsSchema.omit({
  version: true,
  recorder: true,
}).extend({
  version: z.literal('6.0'),
  recorder: RecorderSettingsSchema,
})

export type AppSettings = z.infer<typeof AppSettingsSchema>
