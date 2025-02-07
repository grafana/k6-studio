import { Threshold } from '@/types/thresholds'
import { ImmerStateCreator } from '@/utils/typescript'

interface State {
  thresholds: Array<Threshold>
}

interface Actions {
  setThresholds: (thresholds: Threshold[]) => void
}

export type ThresholdSliceStore = State & Actions

export const createThresholdSlice: ImmerStateCreator<ThresholdSliceStore> = (
  set
) => ({
  thresholds: [],
  setThresholds: (thresholds: Threshold[]) =>
    set((state) => {
      state.thresholds = thresholds
    }),
})
