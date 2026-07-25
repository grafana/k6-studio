import { z } from 'zod'

import {
  AppearanceSchema,
  ProxySettingsSchema,
  RecorderSettingsSchema,
  TelemetrySchema,
  WindowStateSchema,
  type UpstreamProxySettings,
} from '../v4'
import * as v6 from '../v6'

export {
  AppearanceSchema,
  ProxySettingsSchema,
  RecorderSettingsSchema,
  TelemetrySchema,
  WindowStateSchema,
  type UpstreamProxySettings,
}

export const AppSettingsSchema = z.object({
  version: z.literal('5.0'),
  proxy: ProxySettingsSchema,
  recorder: RecorderSettingsSchema,
  windowState: WindowStateSchema,
  telemetry: TelemetrySchema,
  appearance: AppearanceSchema,
})

export type AppSettings = z.infer<typeof AppSettingsSchema>

export function migrate(
  settings: z.infer<typeof AppSettingsSchema>
): v6.AppSettings {
  return {
    ...settings,
    version: '6.0',
    recorder: {
      ...settings.recorder,
      customBrowserLaunchArgs: [],
    },
  }
}
