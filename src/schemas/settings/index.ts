import { z } from 'zod'

import { exhaustive } from '../../utils/typescript'

import * as v1 from './v1'
import * as v2 from './v2'
import * as v3 from './v3'
import * as v4 from './v4'

const AnySettingSchema = z.discriminatedUnion('version', [
  v1.AppSettingsSchema,
  v2.AppSettingsSchema,
  v3.AppSettingsSchema,
  v4.AppSettingsSchema,
])

export function migrate(settings: z.infer<typeof AnySettingSchema>) {
  switch (settings.version) {
    case '1.0':
      return migrate(v1.migrate(settings))
    case '2.0':
      return migrate(v2.migrate(settings))
    case '3.0':
      return migrate(v3.migrate(settings))
    case '4.0':
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
  TelemetrySchema,
  WindowStateSchema,
  type UpstreamProxySettings,
} from './v4'
