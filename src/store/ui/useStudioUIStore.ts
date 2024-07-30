import { FolderContent } from '@/types'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface State extends FolderContent {}

interface Actions {
  addFile: (path: string) => void
  removeFile: (path: string) => void
  setFolderContent: (content: FolderContent) => void
}

export type StudioUIStore = State & Actions

export const useStudioUIStore = create<StudioUIStore>()(
  immer((set) => ({
    recordings: [],
    generators: [],
    scripts: [],

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
  }))
)
