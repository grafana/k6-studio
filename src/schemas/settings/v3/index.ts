import { z } from 'zod'

import {
  AppearanceSchema,
  ProxySettingsSchema,
  RecorderSettingsSchema,
  WindowStateSchema,
} from '../v1'

const TelemetrySchema = z.object({
  usageReport: z.boolean(),
  errorReport: z.boolean(),
})

export {
  AppearanceSchema,
  ProxySettingsSchema,
  RecorderSettingsSchema,
  TelemetrySchema,
  WindowStateSchema,
}

export const AppSettingsSchema = z.object({
  version: z.literal('3.0'),
  proxy: ProxySettingsSchema,
  recorder: RecorderSettingsSchema,
  windowState: WindowStateSchema,
  telemetry: TelemetrySchema,
  appearance: AppearanceSchema,
})

export type AppSettings = z.infer<typeof AppSettingsSchema>

// TODO: Migrate settings to the next version
export function migrate(settings: z.infer<typeof AppSettingsSchema>) {
  return { ...settings }
}
