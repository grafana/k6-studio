import { create } from 'zustand'
import { Tool } from './types'

interface InBrowserUIStore {
  tool: Tool | null
  selectTool: (tool: Tool | null) => void
}

export const useInBrowserUIStore = create<InBrowserUIStore>((set) => {
  return {
    tool: null,
    selectTool: (tool: Tool | null) => set({ tool }),
  }
})
