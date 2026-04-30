import { css } from '@emotion/react'
import { Box, Inset, ScrollArea, Tabs } from '@radix-ui/themes'
import { ReactNode, useState } from 'react'

import { PopoverDialog } from '@/components/PopoverDialogs'
import {
  LoadZoneData,
  LoadProfileExecutorOptions,
  Threshold,
} from '@/types/testOptions'

import { LoadProfile } from './LoadProfile'
import { LoadZones } from './LoadZones'
import { Thresholds, MetricsConfig } from './Thresholds'

export type TabId = 'loadProfile' | 'thresholds' | 'thinkTime' | 'loadZones'

interface ControlledSlot<T> {
  value: T
  onChange: (next: T) => void
}

interface ThresholdsSlot<M extends string> extends ControlledSlot<
  Array<Omit<Threshold, 'metric'> & { metric: M }>
> {
  metricsConfig: MetricsConfig<M>
  resolver?: Parameters<typeof Thresholds>[0]['resolver']
}

interface LoadProfileSlot extends ControlledSlot<LoadProfileExecutorOptions> {
  executors: ReadonlyArray<LoadProfileExecutorOptions['executor']>
}

interface TestOptionsDialogProps<M extends string> {
  trigger: ReactNode
  tabs: ReadonlyArray<TabId>
  loadProfile: LoadProfileSlot
  thresholds: ThresholdsSlot<M>
  loadZones?: ControlledSlot<LoadZoneData>
  thinkTime?: { content: ReactNode }
}

const TAB_LABELS: Record<TabId, string> = {
  loadProfile: 'Load profile',
  thresholds: 'Thresholds',
  thinkTime: 'Think time',
  loadZones: 'Load zones',
}

export function TestOptionsDialog<M extends string>({
  trigger,
  tabs,
  loadProfile,
  thresholds,
  loadZones,
  thinkTime,
}: TestOptionsDialogProps<M>) {
  const [selectedTab, setSelectedTab] = useState<TabId>(
    tabs[0] ?? 'loadProfile'
  )

  return (
    <PopoverDialog align="center" width="780px" trigger={trigger}>
      <Inset>
        <Tabs.Root
          value={selectedTab}
          onValueChange={(v) => setSelectedTab(v as TabId)}
        >
          <Tabs.List
            css={css`
              margin-bottom: var(--space-3);
            `}
          >
            {tabs.map((id) => (
              <Tabs.Trigger key={id} value={id}>
                {TAB_LABELS[id]}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          <ScrollArea
            scrollbars="vertical"
            css={css`
              max-height: 60vh;
            `}
          >
            <Box p="3" pt="0" css={{ '.rt-TabsContent': { outline: 'none' } }}>
              {tabs.includes('loadProfile') && (
                <Tabs.Content value="loadProfile">
                  <LoadProfile
                    value={loadProfile.value}
                    onChange={loadProfile.onChange}
                    executors={loadProfile.executors}
                  />
                </Tabs.Content>
              )}
              {tabs.includes('thresholds') && (
                <Tabs.Content value="thresholds">
                  <Thresholds
                    value={thresholds.value}
                    onChange={thresholds.onChange}
                    metricsConfig={thresholds.metricsConfig}
                    resolver={thresholds.resolver}
                  />
                </Tabs.Content>
              )}
              {tabs.includes('thinkTime') && thinkTime && (
                <Tabs.Content value="thinkTime">
                  {thinkTime.content}
                </Tabs.Content>
              )}
              {tabs.includes('loadZones') && loadZones && (
                <Tabs.Content value="loadZones">
                  <LoadZones
                    value={loadZones.value}
                    onChange={loadZones.onChange}
                  />
                </Tabs.Content>
              )}
            </Box>
          </ScrollArea>
        </Tabs.Root>
      </Inset>
    </PopoverDialog>
  )
}
