import { ProxyData } from '@/types'
import { ImmerStateCreator } from '@/utils/typescript'

interface State {
  requests: ProxyData[]
  recordingPath: string
  allowlist: string[]
  includeStaticAssets: boolean
}

interface Actions {
  setRecording: (recording: ProxyData[], path: string) => void
  resetRecording: () => void
  setAllowlist: (value: string[]) => void
  setIncludeStaticAssets: (value: boolean) => void
}

export type RecordingSliceStore = State & Actions

export const createRecordingSlice: ImmerStateCreator<RecordingSliceStore> = (
  set
) => ({
  requests: [],
  recordingPath: '',
  allowlist: [],
  includeStaticAssets: false,

  setRecording: (requests: ProxyData[], path: string) =>
    set((state) => {
      state.requests = requests
      state.recordingPath = path
    }),
  resetRecording: () =>
    set((state) => {
      state.requests = []
      state.allowlist = []
      state.recordingPath = ''
    }),
  setAllowlist: (value) =>
    set((state) => {
      state.allowlist = value
    }),
  setIncludeStaticAssets: (value) =>
    set((state) => {
      state.includeStaticAssets = value
    }),
})
