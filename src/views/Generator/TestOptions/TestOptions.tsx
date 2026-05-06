import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@radix-ui/themes'
import { SettingsIcon } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'

import { TestOptionsDialog } from '@/components/TestOptions'
import { ThresholdDataSchema } from '@/schemas/generator'
import {
  selectLoadProfileExecutorOptions,
  useGeneratorStore,
} from '@/store/generator'

import { ThinkTime } from './ThinkTime'
import { HTTP_METRICS_CONFIG } from './httpThresholdMetrics'

export function TestOptions() {
  const loadProfile = useGeneratorStore(
    useShallow(selectLoadProfileExecutorOptions)
  )
  const setLoadProfile = useGeneratorStore((store) => store.setLoadProfile)

  const thresholds = useGeneratorStore((store) => store.thresholds)
  const setThresholds = useGeneratorStore((store) => store.setThresholds)

  const loadZones = useGeneratorStore((store) => store.loadZones)
  const setLoadZones = useGeneratorStore((store) => store.setLoadZones)

  return (
    <TestOptionsDialog
      trigger={
        <Button variant="ghost" size="1" color="gray">
          <SettingsIcon />
          Test options
        </Button>
      }
      tabs={['loadProfile', 'thresholds', 'thinkTime', 'loadZones']}
      loadProfile={{
        value: loadProfile,
        onChange: setLoadProfile,
        executors: ['ramping-vus', 'shared-iterations'],
      }}
      thresholds={{
        value: thresholds,
        onChange: setThresholds,
        metricsConfig: HTTP_METRICS_CONFIG,
        resolver: zodResolver(ThresholdDataSchema),
      }}
      loadZones={{ value: loadZones, onChange: setLoadZones }}
      thinkTime={{ content: <ThinkTime /> }}
    />
  )
}
