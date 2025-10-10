import { z } from 'zod'

import {
  AppearanceSchema,
  ProxySettingsSchema,
  RecorderSettingsSchema,
  UsageReportSettingsSchema,
  WindowStateSchema,
} from '../v1'
import * as v3 from '../v3'

export {
  AppearanceSchema,
  ProxySettingsSchema,
  RecorderSettingsSchema,
  UsageReportSettingsSchema,
  WindowStateSchema,
}

export const AppSettingsSchema = z.object({
  version: z.literal('2.0'),
  proxy: ProxySettingsSchema,
  recorder: RecorderSettingsSchema,
  windowState: WindowStateSchema,
  usageReport: UsageReportSettingsSchema,
  appearance: AppearanceSchema,
})

export type AppSettings = z.infer<typeof AppSettingsSchema>

// Migrate settings to the next version
export function migrate(
  settings: z.infer<typeof AppSettingsSchema>
): v3.AppSettings {
  return {
    version: '3.0',
    proxy: settings.proxy,
    recorder: settings.recorder,
    windowState: settings.windowState,
    telemetry: {
      usageReport: settings.usageReport.enabled,
      errorReport: true,
    },
    appearance: settings.appearance,
    ai: {
      provider: 'openai',
    },
  }
}
