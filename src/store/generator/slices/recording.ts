import { ProxyData } from '@/types'
import { ImmerStateCreator } from '@/utils/typescript'

interface State {
  requests: ProxyData[]
  recordingPath: string
  allowlist: string[]
  showAllowlistDialog: boolean
}

interface Actions {
  setRecording: (
    recording: ProxyData[],
    path: string,
    showAllowlistDialog: boolean
  ) => void
  resetRecording: () => void
  setAllowlist: (value: string[]) => void
  setShowAllowlistDialog: (value: boolean) => void
}

export type RecordingSliceStore = State & Actions

export const createRecordingSlice: ImmerStateCreator<RecordingSliceStore> = (
  set
) => ({
  requests: [],
  recordingPath: '',
  allowlist: [],
  showAllowlistDialog: false,

  setRecording: (
    requests: ProxyData[],
    path: string,
    showAllowlistDialog: boolean
  ) =>
    set((state) => {
      state.requests = requests
      state.allowlist = []
      state.recordingPath = path
      state.showAllowlistDialog = showAllowlistDialog
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
  setShowAllowlistDialog: (value) =>
    set((state) => {
      state.showAllowlistDialog = value
    }),
})
