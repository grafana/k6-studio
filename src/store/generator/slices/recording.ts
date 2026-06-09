import { ProxyData } from '@/types'
import { ImmerStateCreator } from '@/utils/typescript'

import {
  extractUniqueJsonPaths,
  shouldResetAllowList,
  shouldShowAllowListDialog,
} from './recording.utils'

interface State {
  requests: ProxyData[]
  recordingPath: string
  recordingError: unknown
  allowlist: string[]
  showAllowlistDialog: boolean
  includeStaticAssets: boolean
}

interface Actions {
  setRecordingPath: (path: string) => void
  setRecording: (recording: ProxyData[]) => void
  setRecordingError: (error: unknown) => void
  resetRecording: () => void
  setAllowlist: (value: string[]) => void
  setIncludeStaticAssets: (value: boolean) => void
  setShowAllowlistDialog: (value: boolean) => void
}

export type PreGeneratedJsonPaths = {
  requestJsonPaths: string[]
  responseJsonPaths: string[]
}
export type RecordingSliceStore = State &
  Actions & {
    metadata: PreGeneratedJsonPaths
  }

export const createRecordingSlice: ImmerStateCreator<RecordingSliceStore> = (
  set
) => ({
  metadata: {
    requestJsonPaths: [],
    responseJsonPaths: [],
  },
  requests: [],
  recordingPath: '',
  recordingError: null,
  allowlist: [],
  includeStaticAssets: false,
  showAllowlistDialog: false,
  setRecordingPath: (path: string) =>
    set((state) => {
      state.recordingPath = path
    }),
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

      const { requestJsonPaths, responseJsonPaths } =
        extractUniqueJsonPaths(requests)

      state.metadata = {
        requestJsonPaths,
        responseJsonPaths,
      }
    }),
  setRecordingError: (error: unknown) =>
    set((state) => {
      state.recordingError = error
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

  setShowAllowlistDialog: (value) =>
    set((state) => {
      state.showAllowlistDialog = value
    }),
})
