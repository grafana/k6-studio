import { queryStaticJsonPaths } from '@/store/generator/slices/json.utils'
import { ProxyData } from '@/types'
import { ImmerStateCreator } from '@/utils/typescript'
import { TypeaheadGetOptionsRequest } from '@/views/Generator/RuleEditor/Typeahead/Typeahead'
import { SuggestionMode } from '@/views/Generator/RuleEditor/Typeahead/useTypeahead'

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
  setRecording: (recording: ProxyData[], path: string) => void
  resetRecording: () => void
  setAllowlist: (value: string[]) => void
  setIncludeStaticAssets: (value: boolean) => void
  setShowAllowlistDialog: (value: boolean) => void
  getResponseJsonPathSuggestion: (
    requestConfig: TypeaheadGetOptionsRequest
  ) => Promise<string[]>
  getRequestJsonPathSuggestion: (
    requestConfig: TypeaheadGetOptionsRequest
  ) => Promise<string[]>
}

export type QueryJsonPathConfig = {
  limit?: number
  mode: SuggestionMode
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
  set,
  get
) => ({
  metadata: {
    requestJsonPaths: [],
    responseJsonPaths: [],
  },
  requests: [],
  recordingPath: '',
  allowlist: [],
  includeStaticAssets: false,
  showAllowlistDialog: false,
  getResponseJsonPathSuggestion: async (
    requestConfig: TypeaheadGetOptionsRequest
  ) => {
    const { mode, query } = requestConfig
    const state = get()
    const options = state.metadata.responseJsonPaths
    const id = state.recordingPath
    return queryStaticJsonPaths(id, query, mode, options)
  },
  getRequestJsonPathSuggestion: async (
    requestConfig: TypeaheadGetOptionsRequest
  ) => {
    const { mode, query } = requestConfig

    const state = get()
    const options = state.metadata.requestJsonPaths
    const id = state.recordingPath
    return queryStaticJsonPaths(id, query, mode, options)
  },
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
