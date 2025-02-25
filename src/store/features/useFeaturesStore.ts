import { Feature } from '@/types/features'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface FeaturesStore {
  features: Record<Feature, boolean>
  toggleFeature: (feature: Feature) => void
}

const defaultFeatures: Record<Feature, boolean> = {
  'data-files': false,
  'load-zones': false,
}

export const useFeaturesStore = create<FeaturesStore>()(
  immer((set) => ({
    features: {
      ...defaultFeatures,
    },
    toggleFeature: (feature) =>
      set((state) => {
        state.features[feature] = !state.features[feature]
      }),
  }))
)
