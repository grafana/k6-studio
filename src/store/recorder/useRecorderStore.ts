import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { ProxyData } from '@/types'
import { mergeRequestsById } from '@/views/Recorder/Recorder.utils'

interface State {
  path: string | null
  isRecording: boolean
  proxyData: ProxyData[]
}

interface Actions {
  addRequest: (request: ProxyData, currentGroup: string) => void
  setPath: (path: string) => void
  setIsRecording: (isRecording: boolean) => void
  setProxyData: (proxyData: ProxyData[]) => void
  resetProxyData: () => void
}

export type RecorderStore = State & Actions

export const useRecorderStore = create<RecorderStore>()(
  immer((set) => ({
    isRecording: false,
    path: null,
    proxyData: [],

    addRequest: (request, currentGroup) =>
      set((state) => {
        state.proxyData = mergeRequestsById(state.proxyData, {
          ...request,
          group: currentGroup,
        })
      }),
    setPath: (path) => set((state) => (state.path = path)),
    setIsRecording: (isRecording) =>
      set((state) => {
        state.isRecording = isRecording
      }),
    setProxyData: (proxyData) =>
      set((state) => {
        state.proxyData = proxyData
      }),
    resetProxyData: () =>
      set((state) => {
        state.proxyData = []
      }),
  }))
)
