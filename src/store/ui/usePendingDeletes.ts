import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface State {
  paths: Set<string>
}

interface Actions {
  add: (path: string) => void
  remove: (path: string) => void
}

export const usePendingDeletesStore = create<State & Actions>()(
  immer((set) => ({
    paths: new Set(),
    add: (path) =>
      set((state) => {
        state.paths.add(path)
      }),
    remove: (path) =>
      set((state) => {
        state.paths.delete(path)
      }),
  }))
)
