import { create } from 'zustand'

import { Tool } from './types'

interface InBrowserUIStore {
  isCaptureBlocked: boolean
  tool: Tool | null
  selectTool: (tool: Tool | null) => void
  blockEventCapture: () => void
  unblockEventCapture: () => void
}

export const useInBrowserUIStore = create<InBrowserUIStore>((set) => {
  return {
    isCaptureBlocked: false,
    tool: null,
    selectTool: (tool: Tool | null) => set({ tool }),
    blockEventCapture: () => set({ isCaptureBlocked: true }),
    unblockEventCapture: () => set({ isCaptureBlocked: false }),
  }
})
