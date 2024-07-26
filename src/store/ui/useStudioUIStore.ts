import { FolderContent } from '@/types'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface State extends FolderContent {
  selectedFile: string | null
}

interface Actions {
  addFile: (path: string) => void
  setSelectedFile: (path: string | null) => void
  setFolderContent: (content: FolderContent) => void
}

export type StudioUIStore = State & Actions

export const useStudioUIStore = create<StudioUIStore>()(
  immer((set) => ({
    recordings: [],
    generators: [],
    scripts: [],
    selectedFile: null,

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
    setSelectedFile: (path) =>
      set((state) => {
        state.selectedFile = path
      }),
    setFolderContent: ({ recordings, generators, scripts }) =>
      set((state) => {
        state.recordings = recordings
        state.generators = generators
        state.scripts = scripts
      }),
  }))
)
