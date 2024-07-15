import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type SleepType = 'groups' | 'requests' | 'iterations'

interface FixedTiming {
  type: 'fixed'
  value: number | null
}

export interface RangeTiming {
  type: 'range'
  value: {
    min: number | null
    max: number | null
  }
}

export type Timing = FixedTiming | RangeTiming

interface ThinkTimeState {
  sleepType: SleepType
  timing: Timing
}

interface ThinkTimeActions {
  setSleepType: (value: SleepType) => void
  setTiming: (timing: Timing) => void
}

export const createFixedTiming = (
  value: number | null = null
): FixedTiming => ({
  type: 'fixed',
  value,
})

export const useThinkTimeStore = create<ThinkTimeState & ThinkTimeActions>()(
  immer((set) => ({
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
  }))
)
