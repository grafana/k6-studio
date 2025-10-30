import { z } from 'zod'

import {
  AppearanceSchema,
  ProxySettingsSchema,
  RecorderSettingsSchema,
  WindowStateSchema,
  type UpstreamProxySettings,
} from '../v1'

const TelemetrySchema = z.object({
  usageReport: z.boolean(),
  errorReport: z.boolean(),
})

const AISettingsSchema = z.object({
  provider: z.enum(['openai']).default('openai'),
  apiKey: z.string().optional(),
})

export {
  AppearanceSchema,
  ProxySettingsSchema,
  RecorderSettingsSchema,
  TelemetrySchema,
  WindowStateSchema,
  type UpstreamProxySettings,
}

export const AppSettingsSchema = z.object({
  version: z.literal('3.0'),
  proxy: ProxySettingsSchema,
  recorder: RecorderSettingsSchema,
  windowState: WindowStateSchema,
  telemetry: TelemetrySchema,
  appearance: AppearanceSchema,
  ai: AISettingsSchema,
})

export type AppSettings = z.infer<typeof AppSettingsSchema>

// TODO: Migrate settings to the next version
export function migrate(settings: z.infer<typeof AppSettingsSchema>) {
  return { ...settings }
}
