import { storage } from 'webextension-polyfill'

import { InBrowserSettings, InBrowserSettingsSchema } from '../messaging/types'

import {
  DEFAULT_SETTINGS,
  OnSettingsUpdateEventHandler,
  SettingsStorage,
} from './view/SettingsProvider'

let storedSettings: InBrowserSettings = DEFAULT_SETTINGS

export function configureStorage(): SettingsStorage {
  let callbacks: OnSettingsUpdateEventHandler[] = []

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

  storage.local.onChanged.addListener((changes) => {
    const latestValues = Object.fromEntries(
      Object.entries(changes).map(([key, change]) => [key, change.newValue])
    )

    const settings = InBrowserSettingsSchema.safeParse({
      ...storedSettings,
      ...latestValues,
    })

    if (!settings.success) {
      console.warn(
        'Failed to parse settings from onChanged listener',
        settings.error
      )

      return
    }

    storedSettings = settings.data

    callbacks.forEach((cb) => cb(storedSettings))
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
    onUpdate(callback: (settings: InBrowserSettings) => void) {
      callbacks = [...callbacks, callback]

      return () => {
        callbacks = callbacks.filter((cb) => cb !== callback)
      }
    },
  }
}
