import { z } from 'zod'
import * as v1 from './v1'
import * as v2 from './v2'
import { exhaustive } from '../../utils/typescript'

const AnySettingSchema = z.discriminatedUnion('version', [
  v1.AppSettingsSchema,
  v2.AppSettingsSchema,
])

export function migrate(settings: z.infer<typeof AnySettingSchema>) {
  switch (settings.version) {
    case '1.0':
      return migrate(v1.migrate(settings))
    case '2.0':
      return settings
    default:
      return exhaustive(settings)
  }
}

export const AppSettingsSchema = AnySettingSchema.transform(migrate)

export {
  AppearanceSchema,
  ProxySettingsSchema,
  RecorderSettingsSchema,
  UsageReportSettingsSchema,
  WindowStateSchema,
} from './v2'