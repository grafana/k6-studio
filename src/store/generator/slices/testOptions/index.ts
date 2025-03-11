import { ImmerStateCreator } from '@/utils/typescript'
import { LoadProfileStore, createLoadProfileSlice } from './loadProfile'
import { ThinkTimeStore, createThinkTimeSlice } from './thinkTime'
import { createThresholdSlice, ThresholdStore } from './thesholds'
import { LoadZoneStore, createLoadZoneSlice } from './loadZones'

export type TestOptionsStore = LoadProfileStore &
  ThinkTimeStore &
  ThresholdStore &
  LoadZoneStore

export const createTestOptionsSlice: ImmerStateCreator<TestOptionsStore> = (
  ...args
) => ({
  ...createLoadProfileSlice(...args),
  ...createThinkTimeSlice(...args),
  ...createThresholdSlice(...args),
  ...createLoadZoneSlice(...args),
})
