import { Feature } from '@/types/features'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'

interface FeaturesStore {
  features: Record<Feature, boolean>
  toggleFeature: (feature: Feature) => void
}

const defaultFeatures: Record<Feature, boolean> = {
  'data-files': false,
}

export const useFeaturesStore = create<FeaturesStore>()(
  persist(
    immer((set) => ({
      features: {
        ...defaultFeatures,
      },
      toggleFeature: (feature) =>
        set((state) => {
          state.features[feature] = !state.features[feature]
        }),
    })),
    { name: 'features-storage' }
  )
)

export function useFeature(feature: Feature) {
  const toggleFeature = useFeaturesStore((state) => state.toggleFeature)
  const isEnabled = useFeaturesStore((state) => state.features[feature])
  const toggleEnabled = () => toggleFeature(feature)

  return [isEnabled, toggleEnabled] as const
}
