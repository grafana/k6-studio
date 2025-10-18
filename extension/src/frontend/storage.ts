import { storage } from 'webextension-polyfill'

import {
  DEFAULT_SETTINGS,
  InBrowserSettings,
  InBrowserSettingsSchema,
  SettingsStorage,
} from './view/SettingsProvider'

let storedSettings: InBrowserSettings = DEFAULT_SETTINGS

export function configureStorage(): SettingsStorage {
  // Load the settings as soon as possible, preferably before the UI mounts
  const loaded = storage.local
    .get(DEFAULT_SETTINGS)
    .then((result) => {
      storedSettings =
        InBrowserSettingsSchema.safeParse(result).data ?? DEFAULT_SETTINGS

      return storedSettings
    })
    .catch((err) => {
      console.error('Failed to load in-browser settings', err)

      return DEFAULT_SETTINGS
    })

  return {
    get initial() {
      return storedSettings
    },
    load() {
      return loaded
    },
    save(newSettings) {
      storedSettings = { ...storedSettings, ...newSettings }

      return storage.local.set(newSettings)
    },
  }
}
