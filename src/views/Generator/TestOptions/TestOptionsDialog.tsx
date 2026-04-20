import { css } from '@emotion/react'
import { Box, Button, Inset, ScrollArea, Tabs } from '@radix-ui/themes'
import { SettingsIcon } from 'lucide-react'
import { useState } from 'react'

import { PopoverDialog } from '@/components/PopoverDialogs'
import { TestRule } from '@/types/rules'
import { TestData } from '@/types/testData'
import {
  LoadProfileExecutorOptions,
  LoadZoneData,
  ThinkTime,
  Threshold,
} from '@/types/testOptions'

import { VariablesEditor } from '../TestData/VariablesEditor'

import { LoadProfile } from './LoadProfile'
import { LoadZones } from './LoadZones'
import { ThinkTime as ThinkTimePanel } from './ThinkTime'
import { Thresholds } from './Thresholds'

export interface TestOptionsDialogProps {
  loadProfile: LoadProfileExecutorOptions
  onLoadProfileChange: (data: LoadProfileExecutorOptions) => void
  thinkTime: Pick<ThinkTime, 'sleepType' | 'timing'>
  onThinkTimeChange: (data: Pick<ThinkTime, 'sleepType' | 'timing'>) => void
  hasGroups: boolean
  thresholds: Threshold[]
  onThresholdsChange: (thresholds: Threshold[]) => void
  loadZones: LoadZoneData
  onLoadZonesChange: (loadZones: LoadZoneData) => void
  variables: TestData['variables']
  onVariablesChange: (variables: TestData['variables']) => void
  rules: TestRule[]
}

export function TestOptionsDialog({
  loadProfile,
  onLoadProfileChange,
  thinkTime,
  onThinkTimeChange,
  hasGroups,
  thresholds,
  onThresholdsChange,
  loadZones,
  onLoadZonesChange,
  variables,
  onVariablesChange,
  rules,
}: TestOptionsDialogProps) {
  const [selectedTab, setSelectedTab] = useState('loadProfile')

  return (
    <PopoverDialog
      align="center"
      width="780px"
      trigger={
        <Button variant="ghost" size="1" color="gray">
          <SettingsIcon />
          Test options
        </Button>
      }
    >
      <Inset>
        <Tabs.Root value={selectedTab} onValueChange={setSelectedTab}>
          <Tabs.List
            css={css`
              margin-bottom: var(--space-3);
            `}
          >
            <Tabs.Trigger value="loadProfile">Load profile</Tabs.Trigger>
            <Tabs.Trigger value="thresholds">Thresholds</Tabs.Trigger>
            <Tabs.Trigger value="thinkTime">Think time</Tabs.Trigger>
            <Tabs.Trigger value="loadZones">Load zones</Tabs.Trigger>
          </Tabs.List>
          <ScrollArea
            scrollbars="vertical"
            css={css`
              max-height: 60vh;
            `}
          >
            <Box p="3" pt="0" css={{ '.rt-TabsContent': { outline: 'none' } }}>
              <Tabs.Content value="loadProfile">
                <LoadProfile
                  loadProfile={loadProfile}
                  onLoadProfileChange={onLoadProfileChange}
                />
              </Tabs.Content>
              <Tabs.Content value="thinkTime">
                <ThinkTimePanel
                  thinkTime={thinkTime}
                  hasGroups={hasGroups}
                  onThinkTimeChange={onThinkTimeChange}
                />
              </Tabs.Content>
              <Tabs.Content value="variables">
                <VariablesEditor
                  variables={variables}
                  rules={rules}
                  onVariablesChange={onVariablesChange}
                />
              </Tabs.Content>
              <Tabs.Content value="thresholds">
                <Thresholds
                  thresholds={thresholds}
                  onThresholdsChange={onThresholdsChange}
                />
              </Tabs.Content>
              <Tabs.Content value="loadZones">
                <LoadZones
                  loadZones={loadZones}
                  onLoadZonesChange={onLoadZonesChange}
                />
              </Tabs.Content>
            </Box>
          </ScrollArea>
        </Tabs.Root>
      </Inset>
    </PopoverDialog>
  )
}
