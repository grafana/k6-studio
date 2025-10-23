import { PropsWithChildren } from 'react'

import { useFeaturesStore } from '@/store/features'
import type { Feature as FeatureType } from '@/types/features'

interface FeatureProps {
  feature: FeatureType
}

export function Feature({
  children,
  feature,
}: PropsWithChildren<FeatureProps>) {
  const isEnabled = useFeaturesStore((state) => state.features[feature])

  if (!isEnabled) {
    return null
  }

  return <>{children}</>
}

export function FeatureDisabled({
  children,
  feature,
}: PropsWithChildren<FeatureProps>) {
  const isDisabled = !useFeaturesStore((state) => state.features[feature])

  if (!isDisabled) {
    return null
  }

  return <>{children}</>
}
