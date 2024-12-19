import { ProxyData } from '@/types'
import { create } from 'zustand'

interface State {
  selectedRequest?: ProxyData
}

interface Actions {
  setSelectedRequest: (request: ProxyData) => void
  clearSelectedRequest: () => void
}

export const useInspectRequest = create<State & Actions>((set) => ({
  selectedRequest: undefined,
  setSelectedRequest: (request) => set({ selectedRequest: request }),
  clearSelectedRequest: () => set({ selectedRequest: undefined }),
}))
