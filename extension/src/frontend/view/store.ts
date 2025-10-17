import { create } from 'zustand'

import { Tool, HighlightSelector } from './types'

interface InBrowserUIStore {
  isCaptureBlocked: boolean
  tool: Tool | null
  highlightSelector: HighlightSelector | null
  selectTool: (tool: Tool | null) => void
  highlightElements: (selector: HighlightSelector | null) => void
  blockEventCapture: () => void
  unblockEventCapture: () => void
}

export const useInBrowserUIStore = create<InBrowserUIStore>((set) => {
  return {
    isCaptureBlocked: false,
    tool: null,
    highlightSelector: null,
    selectTool: (tool: Tool | null) => set({ tool }),

    highlightElements: (selector: HighlightSelector | null) => {
      set({ highlightSelector: selector })
    },

    blockEventCapture: () => set({ isCaptureBlocked: true }),
    unblockEventCapture: () => set({ isCaptureBlocked: false }),
  }
})

export function useHighlightSelector() {
  return useInBrowserUIStore((state) => state.highlightSelector)
}

export function useHighlight() {
  return useInBrowserUIStore((state) => state.highlightElements)
}
