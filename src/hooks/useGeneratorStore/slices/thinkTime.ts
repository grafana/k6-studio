import { ImmerStateCreator } from '@/utils/typescript'
import {
  ThinkTimeState,
  ThinkTimeActions,
  FixedTiming,
  SleepType,
  Timing,
} from '../types'

export const createThinkTimeSlice: ImmerStateCreator<
  ThinkTimeState & ThinkTimeActions
> = (set) => ({
  sleepType: 'groups',
  timing: createFixedTiming(),

  setSleepType: (value: SleepType) =>
    set((state) => {
      state.sleepType = value
    }),

  setTiming: (timing: Timing) =>
    set((state) => {
      state.timing = timing
    }),
})

export const createFixedTiming = (
  value: number | null = null
): FixedTiming => ({
  type: 'fixed',
  value,
})
