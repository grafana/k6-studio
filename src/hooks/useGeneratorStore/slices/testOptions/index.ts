import { ImmerStateCreator } from '@/utils/typescript'
import { LoadProfileStore, createLoadProfileSlice } from './loadProfile'
import { ThinkTimeStore, createThinkTimeSlice } from './thinkTime'

export type TestOptionsStore = LoadProfileStore & ThinkTimeStore

export const createTestOptionsSlice: ImmerStateCreator<
  LoadProfileStore & ThinkTimeStore
> = (...args) => ({
  ...createLoadProfileSlice(...args),
  ...createThinkTimeSlice(...args),
})
