import { FolderContent, ProxyStatus } from '@/types'
import {
  fileFromFileName,
  isGenerator,
  isRecording,
  isScript,
} from '@/utils/file'
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
    recordings: new Map(),
    generators: new Map(),
    scripts: new Map(),
    devToggles: {},
    proxyStatus: 'offline',

    addFile: (path) =>
      set((state) => {
        const file = fileFromFileName(path)

        if (file.type === 'recording') {
          state.recordings.set(path, file)
        }

        if (file.type === 'generator') {
          state.generators.set(path, file)
        }

        if (file.type === 'script') {
          state.scripts.set(path, file)
        }
      }),
    removeFile: (path) =>
      set((state) => {
        if (isRecording(path)) {
          state.recordings.delete(path)
        }

        if (isGenerator(path)) {
          state.generators.delete(path)
        }

        if (isScript(path)) {
          state.scripts.delete(path)
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
