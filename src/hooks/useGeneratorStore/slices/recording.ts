import { ProxyData } from '@/types'
import { ImmerStateCreator } from '@/utils/typescript'

interface State {
  requests: ProxyData[]
  recordingPath: string
  allowList: string[]
  showAllowListDialog: boolean
}

interface Actions {
  setRecording: (recording: ProxyData[], path: string) => void
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
  allowList: [],
  showAllowListDialog: false,

  setRecording: (requests: ProxyData[], path: string) =>
    set((state) => {
      state.requests = requests
      state.allowList = []
      state.recordingPath = path
      state.showAllowListDialog = true
    }),
  resetRecording: () =>
    set((state) => {
      state.requests = []
      state.allowList = []
      state.recordingPath = ''
    }),
  setAllowList: (value) =>
    set((state) => {
      state.allowList = value
    }),
  setShowAllowListDialog: (value) =>
    set((state) => {
      state.showAllowListDialog = value
    }),
})
