import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@radix-ui/themes'
import { SettingsIcon } from 'lucide-react'

import { TestOptionsDialog } from '@/components/TestOptions'
import {
  BrowserTestOptions,
  BrowserThreshold,
  BrowserThresholdDataSchema,
} from '@/schemas/browserTest'
import { LoadProfileExecutorOptions, LoadZoneData } from '@/types/testOptions'

import { BROWSER_METRICS_CONFIG } from './browserThresholdMetrics'

interface BrowserTestOptionsButtonProps {
  options: BrowserTestOptions
  onLoadProfileChange: (next: LoadProfileExecutorOptions) => void
  onThresholdsChange: (next: BrowserThreshold[]) => void
  onLoadZonesChange: (next: LoadZoneData) => void
}

export function BrowserTestOptionsButton({
  options,
  onLoadProfileChange,
  onThresholdsChange,
  onLoadZonesChange,
}: BrowserTestOptionsButtonProps) {
  return (
    <TestOptionsDialog
      trigger={
        <Button variant="ghost" size="1" color="gray">
          <SettingsIcon /> Test options
        </Button>
      }
      tabs={['loadProfile', 'thresholds', 'loadZones']}
      loadProfile={{
        value: options.loadProfile,
        onChange: onLoadProfileChange,
        executors: ['ramping-vus', 'shared-iterations'],
      }}
      thresholds={{
        value: options.thresholds,
        onChange: onThresholdsChange,
        metricsConfig: BROWSER_METRICS_CONFIG,
        resolver: zodResolver(BrowserThresholdDataSchema),
      }}
      loadZones={{
        value: options.cloud.loadZones,
        onChange: onLoadZonesChange,
      }}
    />
  )
}
