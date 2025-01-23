import { Threshold } from '@/types/thresholds'
import { ImmerStateCreator } from '@/utils/typescript'

interface State {
  thresholds: Array<Threshold>
}

interface Actions {
  addThreshold: (threshold: Threshold) => void
  updateThreshold: (threshold: Threshold) => void
  deleteThreshold: (id: string) => void
}

export type ThresholdSliceStore = State & Actions

export const createThresholdSlice: ImmerStateCreator<ThresholdSliceStore> = (
  set
) => ({
  thresholds: [],
  addThreshold: (threshold) =>
    set((state) => {
      state.thresholds.push(threshold)
    }),
  updateThreshold(threshold) {
    set((state) => {
      const index = state.thresholds.findIndex((t) => t.id === threshold.id)
      if (index !== -1) {
        state.thresholds[index] = threshold
      }
    })
  },
  deleteThreshold: (id) =>
    set((state) => {
      state.thresholds = state.thresholds.filter((t) => t.id !== id)
    }),
})
