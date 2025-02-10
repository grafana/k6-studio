import { ProxyData } from '@/types'
import { ImmerStateCreator } from '@/utils/typescript'
import {
  shouldResetAllowList,
  shouldShowAllowListDialog,
} from './recording.utils'

interface State {
  requests: ProxyData[]
  recordingPath: string
  allowlist: string[]
  showAllowlistDialog: boolean
  includeStaticAssets: boolean
}

interface Actions {
  setRecording: (recording: ProxyData[]) => void
  resetRecording: () => void
  setRecordingPath: (path: string) => void
  setAllowlist: (value: string[]) => void
  setIncludeStaticAssets: (value: boolean) => void
  setShowAllowlistDialog: (value: boolean) => void
}

export type RecordingSliceStore = State & Actions

export const createRecordingSlice: ImmerStateCreator<RecordingSliceStore> = (
  set
) => ({
  requests: [],
  recordingPath: '',
  allowlist: [],
  includeStaticAssets: false,
  showAllowlistDialog: false,

  setRecording: (requests: ProxyData[]) =>
    set((state) => {
      if (shouldResetAllowList({ requests, allowList: state.allowlist })) {
        state.allowlist = []
      }

      if (
        shouldShowAllowListDialog({
          previousRequests: state.requests,
          requests,
          allowList: state.allowlist,
        })
      ) {
        state.showAllowlistDialog = true
      }

      state.requests = requests
    }),
  resetRecording: () =>
    set((state) => {
      state.requests = []
      state.allowlist = []
      state.recordingPath = ''
    }),
  setRecordingPath: (path) =>
    set((state) => {
      state.recordingPath = path
    }),
  setAllowlist: (value) =>
    set((state) => {
      state.allowlist = value
    }),
  setIncludeStaticAssets: (value) =>
    set((state) => {
      state.includeStaticAssets = value
    }),

  setShowAllowlistDialog: (value) =>
    set((state) => {
      state.showAllowlistDialog = value
    }),
})
