import { PropsWithChildren } from 'react'

import { useFeature } from '@/store/features'
import type { Feature as FeatureType } from '@/types/features'

interface FeatureProps {
  feature: FeatureType
}

export function Feature({
  children,
  feature,
}: PropsWithChildren<FeatureProps>) {
  const [isEnabled] = useFeature(feature)

  if (!isEnabled) {
    return null
  }

  return <>{children}</>
}
