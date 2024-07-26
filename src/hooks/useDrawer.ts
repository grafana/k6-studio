import { ReactNode } from 'react'
import { create } from 'zustand'

interface DrawerState {
  isOpen: boolean
  content: ReactNode
  renderInSidebar: (content: ReactNode) => void
  close: () => void
}

function createDrawerStore() {
  return create<DrawerState>((set) => ({
    isOpen: false,
    content: null,
    renderInSidebar: (content) => set({ content, isOpen: true }),
    close: () => set({ isOpen: false }),
  }))
}

const drawerStores = {
  right: createDrawerStore(),
  bottom: createDrawerStore(),
}

export function useDrawer(position: 'right' | 'bottom') {
  return drawerStores[position]()
}
