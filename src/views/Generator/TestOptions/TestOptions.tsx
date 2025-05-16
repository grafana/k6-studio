import { css } from '@emotion/react'
import { Box, Button, Inset, ScrollArea, Tabs } from '@radix-ui/themes'
import { SettingsIcon } from 'lucide-react'
import { useState } from 'react'

import { PopoverDialog } from '@/components/PopoverDialogs'

import { VariablesEditor } from '../TestData/VariablesEditor'

import { LoadProfile } from './LoadProfile'
import { LoadZones } from './LoadZones'
import { ThinkTime } from './ThinkTime'
import { Thresholds } from './Thresholds'

export function TestOptions() {
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
                <LoadProfile />
              </Tabs.Content>
              <Tabs.Content value="thinkTime">
                <ThinkTime />
              </Tabs.Content>
              <Tabs.Content value="variables">
                <VariablesEditor />
              </Tabs.Content>
              <Tabs.Content value="thresholds">
                <Thresholds />
              </Tabs.Content>
              <Tabs.Content value="loadZones">
                <LoadZones />
              </Tabs.Content>
            </Box>
          </ScrollArea>
        </Tabs.Root>
      </Inset>
    </PopoverDialog>
  )
}
