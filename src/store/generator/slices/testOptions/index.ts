import { ImmerStateCreator } from '@/utils/typescript'
import { LoadProfileStore, createLoadProfileSlice } from './loadProfile'
import { ThinkTimeStore, createThinkTimeSlice } from './thinkTime'
import { createThresholdSlice, ThresholdStore } from './thesholds'

export type TestOptionsStore = LoadProfileStore &
  ThinkTimeStore &
  ThresholdStore

export const createTestOptionsSlice: ImmerStateCreator<
  LoadProfileStore & ThinkTimeStore & ThresholdStore
> = (...args) => ({
  ...createLoadProfileSlice(...args),
  ...createThinkTimeSlice(...args),
  ...createThresholdSlice(...args),
})
