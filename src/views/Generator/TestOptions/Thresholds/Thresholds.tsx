import { zodResolver } from '@hookform/resolvers/zod'

import { Thresholds as ControlledThresholds } from '@/components/TestOptions/Thresholds'
import { ThresholdDataSchema } from '@/schemas/generator'
import { useGeneratorStore } from '@/store/generator'
import { Threshold } from '@/types/testOptions'

import { HTTP_METRICS_CONFIG } from '../httpThresholdMetrics'

export function Thresholds() {
  const thresholds = useGeneratorStore((s) => s.thresholds)
  const setThresholds = useGeneratorStore((s) => s.setThresholds)
  return (
    <ControlledThresholds
      value={thresholds}
      onChange={(next) => setThresholds(next as Threshold[])}
      metricsConfig={HTTP_METRICS_CONFIG}
      resolver={zodResolver(ThresholdDataSchema)}
    />
  )
}
