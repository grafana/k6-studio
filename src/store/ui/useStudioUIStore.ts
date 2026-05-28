import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { SettingsTabValue } from '@/components/Settings/types'
import { FolderContent, ProxyStatus, StudioFile } from '@/types'
import * as path from '@/utils/path'
import { exhaustive } from '@/utils/typescript'

interface State extends FolderContent {
  proxyStatus: ProxyStatus
  isSettingsDialogOpen: boolean
  selectedSettingsTab: SettingsTabValue
  isProfileDialogOpen: boolean
}

interface Actions {
  addFile: (file: StudioFile) => void
  removeFile: (file: StudioFile) => void
  setFolderContent: (content: FolderContent) => void
  setProxyStatus: (status: ProxyStatus) => void
  openSettingsDialog: (tab?: SettingsTabValue) => void
  closeSettingsDialog: () => void
  openProfileDialog: () => void
  closeProfileDialog: () => void
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
    isProfileDialogOpen: false,

    addFile: (file) =>
      set((state) => {
        const fileKey = path.key(file.path)
        switch (file.type) {
          case 'recording':
            state.recordings.set(fileKey, file)
            break
          case 'generator':
            state.generators.set(fileKey, file)
            break
          case 'browser-test':
            state.browserTests.set(fileKey, file)
            break
          case 'script':
            state.scripts.set(fileKey, file)
            break
          case 'data-file':
            state.dataFiles.set(fileKey, file)
            break
          default:
            exhaustive(file.type)
        }
      }),
    removeFile: (file) =>
      set((state) => {
        const fileKey = path.key(file.path)
        switch (file.type) {
          case 'recording':
            state.recordings.delete(fileKey)
            break
          case 'generator':
            state.generators.delete(fileKey)
            break
          case 'browser-test':
            state.browserTests.delete(fileKey)
            break
          case 'script':
            state.scripts.delete(fileKey)
            break
          case 'data-file':
            state.dataFiles.delete(fileKey)
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
    openProfileDialog: () =>
      set((state) => {
        state.isProfileDialogOpen = true
      }),
    closeProfileDialog: () =>
      set((state) => {
        state.isProfileDialogOpen = false
      }),
  }))
)
