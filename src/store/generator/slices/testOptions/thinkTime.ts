import { SleepType, ThinkTime, Timing } from '@/types/testOptions'
import { createFixedTiming } from '@/utils/thinkTime'
import { ImmerStateCreator } from '@/utils/typescript'

interface Actions {
  setSleepType: (value: SleepType) => void
  setTiming: (timing: Timing) => void
}

export type ThinkTimeStore = ThinkTime & Actions

export const createThinkTimeSlice: ImmerStateCreator<ThinkTimeStore> = (
  set
) => ({
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
