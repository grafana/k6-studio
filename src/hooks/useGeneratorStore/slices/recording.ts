import { ProxyData } from '@/types'
import { ImmerStateCreator } from '@/utils/typescript'

interface State {
  requests: ProxyData[]
  recordingPath: string
  allowList: string[]
  filteredRequests: ProxyData[]
  showAllowListDialog: boolean
}

interface Actions {
  setRecording: (recording: ProxyData[], path: string) => void
  resetRecording: () => void
  setAllowList: (value: string[]) => void
  setFilteredRequests: (requests: ProxyData[]) => void
  setShowAllowListDialog: (value: boolean) => void
}

export type RecordingSliceStore = State & Actions

export const createRecordingSlice: ImmerStateCreator<RecordingSliceStore> = (
  set
) => ({
  requests: [],
  recordingPath: '',
  allowList: [],
  filteredRequests: [],
  showAllowListDialog: false,

  setRecording: (requests: ProxyData[], path: string) =>
    set((state) => {
      state.requests = requests
      state.allowList = []
      state.filteredRequests = []
      state.recordingPath = path
      state.showAllowListDialog = true
    }),
  resetRecording: () =>
    set((state) => {
      state.requests = []
      state.allowList = []
      state.filteredRequests = []
      state.recordingPath = ''
    }),
  setAllowList: (value) =>
    set((state) => {
      state.allowList = value
    }),
  setFilteredRequests: (requests) =>
    set((state) => {
      state.filteredRequests = requests
    }),
  setShowAllowListDialog: (value) =>
    set((state) => {
      state.showAllowListDialog = value
    }),
})
