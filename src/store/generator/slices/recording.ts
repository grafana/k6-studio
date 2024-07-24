import { ProxyData } from '@/types'
import { ImmerStateCreator } from '@/utils/typescript'

interface State {
  requests: ProxyData[]
  recordingPath: string
  allowlist: string[]
  showAllowListDialog: boolean
}

interface Actions {
  setRecording: (
    recording: ProxyData[],
    path: string,
    showAllowListDialog: boolean
  ) => void
  resetRecording: () => void
  setAllowList: (value: string[]) => void
  setShowAllowListDialog: (value: boolean) => void
}

export type RecordingSliceStore = State & Actions

export const createRecordingSlice: ImmerStateCreator<RecordingSliceStore> = (
  set
) => ({
  requests: [],
  recordingPath: '',
  allowlist: [],
  showAllowListDialog: false,

  setRecording: (
    requests: ProxyData[],
    path: string,
    showAllowListDialog: boolean
  ) =>
    set((state) => {
      state.requests = requests
      state.allowlist = []
      state.recordingPath = path
      state.showAllowListDialog = showAllowListDialog
    }),
  resetRecording: () =>
    set((state) => {
      state.requests = []
      state.allowlist = []
      state.recordingPath = ''
    }),
  setAllowList: (value) =>
    set((state) => {
      state.allowlist = value
    }),
  setShowAllowListDialog: (value) =>
    set((state) => {
      state.showAllowListDialog = value
    }),
})
