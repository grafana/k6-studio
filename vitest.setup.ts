import { afterEach, vi } from 'vitest'

/**
 * Node can expose a partial/broken `globalThis.localStorage` (e.g. when
 * `--localstorage-file` is set without a valid path). Vitest + jsdom expect a
 * full Storage API; stub a small in-memory implementation for all tests.
 */
const store = new Map<string, string>()

const localStorageMock: Storage = {
  get length() {
    return store.size
  },
  clear: () => {
    store.clear()
  },
  getItem: (key: string) => store.get(key) ?? null,
  key: (index: number) => Array.from(store.keys())[index] ?? null,
  removeItem: (key: string) => {
    store.delete(key)
  },
  setItem: (key: string, value: string) => {
    store.set(key, value)
  },
}

vi.stubGlobal('localStorage', localStorageMock)

afterEach(() => {
  store.clear()
})
