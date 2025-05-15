import { ProxyData } from '@/types'
import { ImmerStateCreator } from '@/utils/typescript'

import {
  generateJsonPaths,
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
  setRecording: (recording: ProxyData[], path: string) => void
  resetRecording: () => void
  setAllowlist: (value: string[]) => void
  setIncludeStaticAssets: (value: boolean) => void
  setShowAllowlistDialog: (value: boolean) => void
}

export type JsonPathType = 'request' | 'response'
export type RecordingSliceStore = State &
  Actions & {
    getJsonPaths: (type: JsonPathType) => string[]
  }

export const createRecordingSlice: ImmerStateCreator<RecordingSliceStore> = (
  set,
  getState
) => ({
  requests: [],
  recordingPath: '',
  allowlist: [],
  /**
   * @poc
   * @description Realistically, should generate this during a recording. Measure size of data, and do a round-robin on the lazy loading of the data for the typeahead.
   */
  getJsonPaths: (type: JsonPathType) => {
    const { response, request } = generateJsonPaths(getState().requests)
    if (type === 'request') {
      return request
    } else if (type === 'response') {
      return response
    }
    return []
  },
  includeStaticAssets: false,
  showAllowlistDialog: false,
  setRecording: (requests: ProxyData[], path: string) =>
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

  setShowAllowlistDialog: (value) =>
    set((state) => {
      state.showAllowlistDialog = value
    }),
})
