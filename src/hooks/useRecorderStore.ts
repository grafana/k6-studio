import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { ProxyData } from '@/types'
import { mergeRequestsById } from '@/views/Recorder/Recorder.utils'

interface RecorderState {
  isRecording: boolean
  proxyData: ProxyData[]
  addRequest: (request: ProxyData, currentGroup: string) => void
  setIsRecording: (isRecording: boolean) => void
  setProxyData: (proxyData: ProxyData[]) => void
  resetProxyData: () => void
}

export const useRecorderStore = create<RecorderState>()(
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
