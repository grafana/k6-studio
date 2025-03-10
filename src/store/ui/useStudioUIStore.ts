import { FolderContent, ProxyStatus, StudioFile } from '@/types'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface State extends FolderContent {
  proxyStatus: ProxyStatus
  isSettingsDialogOpen: boolean
}

interface Actions {
  addFile: (file: StudioFile) => void
  removeFile: (file: StudioFile) => void
  setFolderContent: (content: FolderContent) => void
  setProxyStatus: (status: ProxyStatus) => void
  setIsSettingsDialogOpen: (isOpen: boolean) => void
}

export type StudioUIStore = State & Actions

export const useStudioUIStore = create<StudioUIStore>()(
  immer((set) => ({
    recordings: new Map(),
    generators: new Map(),
    scripts: new Map(),
    dataFiles: new Map(),
    proxyStatus: 'offline',
    isSettingsDialogOpen: false,

    addFile: (file) =>
      set((state) => {
        if (file.type === 'recording') {
          state.recordings.set(file.fileName, file)
        }

        if (file.type === 'generator') {
          state.generators.set(file.fileName, file)
        }

        if (file.type === 'script') {
          state.scripts.set(file.fileName, file)
        }

        if (file.type === 'data-file') {
          state.dataFiles.set(file.fileName, file)
        }
      }),
    removeFile: (file) =>
      set((state) => {
        if (file.type === 'recording') {
          state.recordings.delete(file.fileName)
        }

        if (file.type === 'generator') {
          state.generators.delete(file.fileName)
        }

        if (file.type === 'script') {
          state.scripts.delete(file.fileName)
        }

        if (file.type === 'data-file') {
          state.dataFiles.delete(file.fileName)
        }
      }),
    setFolderContent: ({ recordings, generators, scripts, dataFiles }) =>
      set((state) => {
        state.recordings = recordings
        state.generators = generators
        state.scripts = scripts
        state.dataFiles = dataFiles
      }),
    setProxyStatus: (status) =>
      set((state) => {
        state.proxyStatus = status
      }),
    setIsSettingsDialogOpen: (isOpen) =>
      set((state) => {
        state.isSettingsDialogOpen = isOpen
      }),
  }))
)
