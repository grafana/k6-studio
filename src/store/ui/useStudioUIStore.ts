import { FolderContent, ProxyStatus } from '@/types'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface State extends FolderContent {
  devToggles: Record<string, boolean>
  proxyStatus: ProxyStatus
}

interface Actions {
  addFile: (path: string) => void
  removeFile: (path: string) => void
  setFolderContent: (content: FolderContent) => void
  setProxyStatus: (status: ProxyStatus) => void
  toggleDevToggle: (key: string) => void
}

export type StudioUIStore = State & Actions

export const useStudioUIStore = create<StudioUIStore>()(
  immer((set) => ({
    recordings: [],
    generators: [],
    scripts: [],
    devToggles: {},
    proxyStatus: 'offline',

    addFile: (path) =>
      set((state) => {
        if (path.endsWith('.har')) {
          state.recordings.push(path)
        }

        if (path.endsWith('.json')) {
          state.generators.push(path)
        }

        if (path.endsWith('.js')) {
          state.scripts.push(path)
        }
      }),
    removeFile: (path) =>
      set((state) => {
        if (path.endsWith('.har')) {
          state.recordings = state.recordings.filter((file) => file !== path)
        }

        if (path.endsWith('.json')) {
          state.generators = state.generators.filter((file) => file !== path)
        }

        if (path.endsWith('.js')) {
          state.scripts = state.scripts.filter((file) => file !== path)
        }
      }),
    setFolderContent: ({ recordings, generators, scripts }) =>
      set((state) => {
        state.recordings = recordings
        state.generators = generators
        state.scripts = scripts
      }),
    setProxyStatus: (status) =>
      set((state) => {
        state.proxyStatus = status
      }),
    toggleDevToggle: (key) =>
      set((state) => {
        state.devToggles[key] = !state.devToggles[key]
      }),
  }))
)
