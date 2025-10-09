import { useEffect, useState } from 'react'

import {
  SettingsStorage,
  InBrowserSettings,
  getSettingsStorage,
} from 'extension/src/core/settings'

export function useInBrowserSettings() {
  const [settings, setSettings] = useState<InBrowserSettings>(
    SettingsStorage.initialSettings
  )

  useEffect(() => {
    // We sync the settings here just in case the weren't loaded before the UI mounted.
    getSettingsStorage()
      .load()
      .then(setSettings)
      .catch((err) => {
        console.error('Failed to load in-browser settings', err)
      })
  }, [])

  function setSettingsWithSync(
    newSettings: Partial<InBrowserSettings>,
    commit = true
  ) {
    const nextSettings = {
      ...settings,
      ...newSettings,
    }

    if (commit) {
      getSettingsStorage()
        .save(nextSettings)
        .catch((err) => {
          console.error('Failed to commit in-browser settings', err)
        })
    }

    setSettings(nextSettings)
  }

  return [settings, setSettingsWithSync] as const
}

export function useToolboxSettings() {
  const [settings, setSettings] = useInBrowserSettings()

  function setToolboxSettings(
    settings: InBrowserSettings['toolbox'],
    commit = true
  ) {
    setSettings({ toolbox: settings }, commit)
  }

  return [settings.toolbox, setToolboxSettings] as const
}
