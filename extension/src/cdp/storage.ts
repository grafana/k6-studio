import {
  DEFAULT_SETTINGS,
  InBrowserSettings,
  SettingsStorage,
} from '../frontend/view/SettingsProvider'

export function configureStorage(): SettingsStorage {
  let settings = DEFAULT_SETTINGS

  return {
    get initial() {
      return settings
    },
    load() {
      return Promise.resolve(settings)
    },
    save(newSettings: Partial<InBrowserSettings>) {
      settings = {
        ...settings,
        ...newSettings,
      }

      return Promise.resolve()
    },
  }
}
