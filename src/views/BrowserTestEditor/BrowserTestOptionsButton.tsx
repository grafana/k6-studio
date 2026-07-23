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
  // The callback here is unfortunate, but without it we risk using a stale `options` object. It's
  // because of the way we simulate a constrolled form with `useControlledForm`.
  onChange: (callback: (prev: BrowserTestOptions) => BrowserTestOptions) => void
}

export function BrowserTestOptionsButton({
  options,
  onChange,
}: BrowserTestOptionsButtonProps) {
  const handleLoadProfileChange = (
    newLoadProfile: LoadProfileExecutorOptions
  ) => {
    onChange((prev) => ({
      ...prev,
      loadProfile: {
        // Merge so inactive-branch fields (e.g. user's stages while
        // shared-iterations is active) survive an executor switch. Codegen
        // reads only the active branch, so shadow fields are ignored.
        ...options.loadProfile,
        ...newLoadProfile,
      },
    }))
  }

  const handleThresholdsChange = (newThresholds: BrowserThreshold[]) => {
    onChange((prev) => ({
      ...prev,
      thresholds: newThresholds,
    }))
  }

  const handleLoadZonesChange = (newLoadZones: LoadZoneData) => {
    onChange((prev) => ({
      ...prev,
      cloud: {
        ...prev.cloud,
        loadZones: newLoadZones,
      },
    }))
  }

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
        onChange: handleLoadProfileChange,
        executors: ['ramping-vus', 'shared-iterations'],
      }}
      thresholds={{
        value: options.thresholds,
        onChange: handleThresholdsChange,
        metricsConfig: BROWSER_METRICS_CONFIG,
        resolver: zodResolver(BrowserThresholdDataSchema),
      }}
      loadZones={{
        value: options.cloud.loadZones,
        onChange: handleLoadZonesChange,
      }}
    />
  )
}
