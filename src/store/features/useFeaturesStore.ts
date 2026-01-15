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
  // @ts-expect-error - Electron apps are built as CJS.
  'browser-test-editor': import.meta.env.DEV,
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
