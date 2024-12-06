import {
  AppSettingsSchema,
  ProxySettingsSchema,
  RecorderSettingsSchema,
  UsageReportSettingsSchema,
} from '@/schemas/settings'
import { z } from 'zod'

export type AppSettings = z.infer<typeof AppSettingsSchema>
export type ProxySettings = z.infer<typeof ProxySettingsSchema>
export type RecorderSettings = z.infer<typeof RecorderSettingsSchema>
export type UsageReportSettings = z.infer<typeof UsageReportSettingsSchema>
