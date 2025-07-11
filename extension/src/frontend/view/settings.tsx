import { useEffect, useState } from 'react'
import { storage } from 'webextension-polyfill'
import { z } from 'zod'

const InBrowserSettingsSchema = z.object({
  toolbox: z.object({
    position: z.object({
      left: z.number(),
    }),
  }),
})

export type InBrowserSettings = z.infer<typeof InBrowserSettingsSchema>

const DEFAULT_SETTINGS: InBrowserSettings = {
  toolbox: {
    position: {
      // Position in vw units
      left: 50,
    },
  },
}

// Load the settings as soon as possible, preferably before the UI mounts
let storedSettings: InBrowserSettings = DEFAULT_SETTINGS

const loaded = storage.local.get(DEFAULT_SETTINGS).then((result) => {
  storedSettings =
    InBrowserSettingsSchema.safeParse(result).data ?? DEFAULT_SETTINGS

  return storedSettings
})

export function useInBrowserSettings() {
  const [settings, setSettings] = useState<InBrowserSettings>(storedSettings)

  useEffect(() => {
    // We sync the settings here just in case the weren't loaded before the UI mounted.
    loaded.then(setSettings).catch((err) => {
      console.error('Failed to load in-browser settings', err)
    })
  }, [])

  function setSettingsWithSync(
    newSettings: Partial<InBrowserSettings>,
    commit = true
  ) {
    if (commit) {
      storage.local.set(newSettings).catch((err) => {
        console.error('Failed to commit in-browser settings', err)
      })
    }

    setSettings((prevSettings) => ({
      ...prevSettings,
      ...newSettings,
    }))
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
