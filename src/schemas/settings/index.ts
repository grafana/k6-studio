import { z } from 'zod'
import * as v1 from './v1'

const AnySettingSchema = z.discriminatedUnion('version', [v1.AppSettingsSchema])

function migrate(settings: z.infer<typeof AnySettingSchema>) {
  switch (settings.version) {
    case '1.0':
      return settings
  }
}

export const AppSettingsSchema = AnySettingSchema.transform(migrate)
