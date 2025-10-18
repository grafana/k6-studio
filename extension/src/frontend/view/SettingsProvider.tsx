import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import { z } from 'zod'

const context = createContext<SettingsStorage | null>(null)

export const InBrowserSettingsSchema = z.object({
  toolbox: z.object({
    position: z.object({
      left: z.number(),
    }),
  }),
})

export type InBrowserSettings = z.infer<typeof InBrowserSettingsSchema>

export const DEFAULT_SETTINGS: InBrowserSettings = {
  toolbox: {
    position: {
      // Position in vw units
      left: 50,
    },
  },
}

export interface SettingsStorage {
  initial: InBrowserSettings
  load(): Promise<InBrowserSettings>
  save(settings: Partial<InBrowserSettings>): Promise<void>
}

function useSettingsStorage(): SettingsStorage {
  const storage = useContext(context)

  if (storage === null) {
    throw new Error(
      'useSettingsStorage must be used within a SettingsStorageProvider'
    )
  }

  return storage
}

export function useInBrowserSettings() {
  const storage = useSettingsStorage()

  const [settings, setSettings] = useState<InBrowserSettings>(storage.initial)

  useEffect(() => {
    // We sync the settings here just in case the weren't loaded before the UI mounted.
    storage
      .load()
      .then(setSettings)
      .catch((err) => {
        console.error('Failed to load in-browser settings', err)
      })
  }, [storage])

  function setSettingsWithSync(
    newSettings: Partial<InBrowserSettings>,
    commit = true
  ) {
    if (commit) {
      storage.save(newSettings).catch((err) => {
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

interface SettingsProviderProps {
  storage: SettingsStorage
  children: ReactNode
}

export function SettingsProvider({ storage, children }: SettingsProviderProps) {
  return <context.Provider value={storage}>{children}</context.Provider>
}
