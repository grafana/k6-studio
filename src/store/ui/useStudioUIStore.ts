import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { SettingsTabValue } from '@/components/Settings/types'
import { FolderContent, ProxyStatus, StudioFile } from '@/types'
import { exhaustive } from '@/utils/typescript'

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
    browserTests: new Map(),
    proxyStatus: 'offline',
    isSettingsDialogOpen: false,
    selectedSettingsTab: 'proxy',

    addFile: (file) =>
      set((state) => {
        switch (file.type) {
          case 'recording':
            state.recordings.set(file.fileName, file)
            break
          case 'generator':
            state.generators.set(file.fileName, file)
            break
          case 'browser-test':
            state.browserTests.set(file.fileName, file)
            break
          case 'script':
            state.scripts.set(file.fileName, file)
            break
          case 'data-file':
            state.dataFiles.set(file.fileName, file)
            break
          default:
            exhaustive(file.type)
        }
      }),
    removeFile: (file) =>
      set((state) => {
        switch (file.type) {
          case 'recording':
            state.recordings.delete(file.fileName)
            break
          case 'generator':
            state.generators.delete(file.fileName)
            break
          case 'browser-test':
            state.browserTests.delete(file.fileName)
            break
          case 'script':
            state.scripts.delete(file.fileName)
            break
          case 'data-file':
            state.dataFiles.delete(file.fileName)
            break
          default:
            exhaustive(file.type)
        }
      }),
    setFolderContent: ({
      recordings,
      generators,
      browserTests,
      scripts,
      dataFiles,
    }) =>
      set((state) => {
        state.recordings = recordings
        state.generators = generators
        state.browserTests = browserTests
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
