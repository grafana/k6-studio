import { z } from 'zod'
import {
  AppearanceSchema,
  ProxySettingsSchema,
  RecorderSettingsSchema,
  UsageReportSettingsSchema,
  WindowStateSchema,
} from '../v1'

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
  general: z.object({
    usageReport: UsageReportSettingsSchema,
    appearance: AppearanceSchema,
  }),
})

export type AppSettings = z.infer<typeof AppSettingsSchema>

// TODO: Migrate settings to the next version
export function migrate(settings: z.infer<typeof AppSettingsSchema>) {
  return { ...settings }
}
