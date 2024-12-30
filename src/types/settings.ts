import {
  AppSettingsSchema,
  ProxySettingsSchema,
  RecorderSettingsSchema,
  TelemetrySchema,
} from '@/schemas/settings'
import { z } from 'zod'

export type AppSettings = z.infer<typeof AppSettingsSchema>
export type ProxySettings = z.infer<typeof ProxySettingsSchema>
export type RecorderSettings = z.infer<typeof RecorderSettingsSchema>
export type TelemetrySettings = z.infer<typeof TelemetrySchema>
