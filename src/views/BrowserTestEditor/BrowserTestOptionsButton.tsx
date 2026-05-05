import { zodResolver } from '@hookform/resolvers/zod'
import { SettingsIcon } from 'lucide-react'

import { ButtonWithTooltip } from '@/components/ButtonWithTooltip'
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
        <ButtonWithTooltip variant="ghost" color="gray" tooltip="Test options">
          <SettingsIcon />
        </ButtonWithTooltip>
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
