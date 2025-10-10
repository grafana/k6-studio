import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { Feature } from '@/types/features'

interface FeaturesStore {
  features: Record<Feature, boolean>
  toggleFeature: (feature: Feature) => void
}

export const defaultFeatures: Record<Feature, boolean> = {
  'dummy-feature': false,
  'typeahead-json': false,
  'auto-correlation': false,
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
