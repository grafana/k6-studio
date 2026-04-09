import { BrowserExtensionClient } from './messaging'
import { InBrowserSettings } from './messaging/types'
import {
  DEFAULT_SETTINGS,
  OnSettingsUpdateEventHandler,
  SettingsStorage,
} from './ui/SettingsProvider'
import { getTabId } from './utils'

export function configureStorage(
  client: BrowserExtensionClient
): SettingsStorage {
  let settings = DEFAULT_SETTINGS
  let callbacks: OnSettingsUpdateEventHandler[] = []

  client.on('sync-settings', ({ data }) => {
    if (data.tab !== getTabId()) {
      return
    }

    settings = data.settings ?? DEFAULT_SETTINGS

    callbacks.forEach((cb) => cb(settings))
  })

  client.send({
    type: 'load-settings',
    tab: getTabId(),
  })

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

      client.send({
        type: 'save-settings',
        settings,
        tab: getTabId(),
      })

      return Promise.resolve()
    },
    onUpdate(callback: (settings: InBrowserSettings) => void) {
      callbacks = [...callbacks, callback]

      return () => {
        callbacks = callbacks.filter((cb) => cb !== callback)
      }
    },
  }
}
