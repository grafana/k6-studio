import { z } from 'zod'

const InBrowserSettingsSchema = z.object({
  toolbox: z.object({
    position: z.object({
      left: z.number(),
    }),
  }),
})

const DEFAULT_SETTINGS: InBrowserSettings = {
  toolbox: {
    position: {
      // Position in vw units
      left: 50,
    },
  },
}

export type InBrowserSettings = z.infer<typeof InBrowserSettingsSchema>

export interface StorageBackend {
  get(defaults: Record<string, unknown>): Promise<Record<string, unknown>>
  set(data: Record<string, unknown>): Promise<void>
}

export class SettingsStorage {
  static initialSettings = DEFAULT_SETTINGS

  #storage: StorageBackend
  #settings: Promise<InBrowserSettings> | null = null

  constructor(storage: StorageBackend) {
    this.#storage = storage
  }

  load(): Promise<InBrowserSettings> {
    this.#settings =
      this.#settings ??
      this.#storage
        .get(DEFAULT_SETTINGS)
        .then((data) => InBrowserSettingsSchema.parse(data))
        .then((settings) => {
          SettingsStorage.initialSettings = settings

          return settings
        })
        .catch(() => DEFAULT_SETTINGS)

    return this.#settings
  }

  save(settings: InBrowserSettings) {
    return this.#storage.set(settings).then(() => {
      this.#settings = Promise.resolve(settings)

      return settings
    })
  }
}

let settingsStorage: SettingsStorage | null = null

export function getSettingsStorage() {
  if (settingsStorage === null) {
    throw new Error('Settings storage not initialized')
  }

  return settingsStorage
}

export function initializeSettingsStorage(backend: StorageBackend) {
  settingsStorage = new SettingsStorage(backend)

  // Load settings immediately so that they're available as soon as possible.
  settingsStorage.load().catch(() => {})
}
