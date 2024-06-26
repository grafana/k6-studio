import { ReactNode } from 'react'
import { create } from 'zustand'

interface SidebarState {
  isOpen: boolean
  content: ReactNode
  renderInSidebar: (content: ReactNode) => void
  close: () => void
}

export const useSidebar = create<SidebarState>((set) => ({
  isOpen: false,
  content: null,
  renderInSidebar: (content) => set({ content, isOpen: true }),
  close: () => set({ isOpen: false }),
}))
