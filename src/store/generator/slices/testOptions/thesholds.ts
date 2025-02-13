import { Threshold } from '@/types/testOptions'
import { ImmerStateCreator } from '@/utils/typescript'

interface State {
  thresholds: Array<Threshold>
}

interface Actions {
  setThresholds: (thresholds: Threshold[]) => void
}

export type ThresholdStore = State & Actions

export const createThresholdSlice: ImmerStateCreator<ThresholdStore> = (
  set
) => ({
  thresholds: [],
  setThresholds: (thresholds: Threshold[]) =>
    set((state) => {
      state.thresholds = thresholds
    }),
})
