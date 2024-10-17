import { AppSettingsSchema, ProxySettingsSchema } from '@/schemas/appSettings'
import { z } from 'zod'

export type AppSettings = z.infer<typeof AppSettingsSchema>
export type ProxySettings = z.infer<typeof ProxySettingsSchema>
