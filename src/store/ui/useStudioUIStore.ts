import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { SettingsTabValue } from '@/components/Settings/types'
import { FolderContent, ProxyStatus, StudioFile } from '@/types'

interface State extends FolderContent {
  proxyStatus: ProxyStatus
  isSettingsDialogOpen: boolean
  selectedSettingsTab: SettingsTabValue
}

interface Actions {
  addFile: (file: StudioFile) => void
  removeFile: (file: StudioFile) => void
  setFolderContent: (content: FolderContent) => void
  setProxyStatus: (status: ProxyStatus) => void
  openSettingsDialog: (tab?: SettingsTabValue) => void
  closeSettingsDialog: () => void
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
    selectedSettingsTab: 'proxy',

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
    openSettingsDialog: (tab) =>
      set((state) => {
        state.selectedSettingsTab = tab || 'proxy'
        state.isSettingsDialogOpen = true
      }),
    closeSettingsDialog: () =>
      set((state) => {
        state.isSettingsDialogOpen = false
        state.selectedSettingsTab = 'proxy'
      }),
  }))
)
