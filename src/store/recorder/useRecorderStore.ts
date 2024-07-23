import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { ProxyData } from '@/types'
import { mergeRequestsById } from '@/views/Recorder/Recorder.utils'

interface State {
  isRecording: boolean
  proxyData: ProxyData[]
}

interface Actions {
  addRequest: (request: ProxyData, currentGroup: string) => void
  setIsRecording: (isRecording: boolean) => void
  setProxyData: (proxyData: ProxyData[]) => void
  resetProxyData: () => void
}

export type RecorderStore = State & Actions

export const useRecorderStore = create<RecorderStore>()(
  immer((set) => ({
    isRecording: false,
    proxyData: [],

    addRequest: (request: ProxyData, currentGroup: string) =>
      set((state) => {
        state.proxyData = mergeRequestsById(state.proxyData, {
          ...request,
          group: currentGroup,
        })
      }),
    setIsRecording: (isRecording: boolean) =>
      set((state) => {
        state.isRecording = isRecording
      }),
    setProxyData: (proxyData: ProxyData[]) =>
      set((state) => {
        state.proxyData = proxyData
      }),
    resetProxyData: () =>
      set((state) => {
        state.proxyData = []
      }),
  }))
)
