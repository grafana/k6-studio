import { useMemo } from 'react'

import { useFeaturesStore } from '@/store/features'
import { Feature } from '@/types/features'

import { AiSettings } from './AiSettings'
import { AppearanceSettings } from './AppearanceSettings'
import { LogsSettings } from './LogsSettings'
import { ProxySettings } from './ProxySettings'
import { RecorderSettings } from './RecorderSettings'
import { TelemetrySettings } from './TelemetrySettings'
import { SettingsTabValue } from './types'

const TABS: Array<{
  label: string
  value: SettingsTabValue
  component: () => React.ReactNode
  featureToggle?: Feature
}> = [
  { label: 'Proxy', value: 'proxy', component: ProxySettings },
  { label: 'Recorder', value: 'recorder', component: RecorderSettings },
  {
    label: 'Telemetry',
    value: 'usageReport',
    component: TelemetrySettings,
  },
  {
    label: 'Appearance',
    value: 'appearance',
    component: AppearanceSettings,
  },
  {
    label: 'AI',
    value: 'ai',
    component: AiSettings,
    featureToggle: 'auto-correlation',
  },
  {
    label: 'Logs',
    value: 'logs',
    component: LogsSettings,
  },
]

export function useEnabledTabs() {
  const features = useFeaturesStore((state) => state.features)

  return useMemo(
    () =>
      TABS.filter((tab) => !tab.featureToggle || features[tab.featureToggle]),
    [features]
  )
}
