import { GearIcon } from '@radix-ui/react-icons'
import { Box, Button, Inset, ScrollArea, Tabs } from '@radix-ui/themes'
import { css } from '@emotion/react'

import { LoadProfile } from './LoadProfile'
import { ThinkTime } from './ThinkTime'
import { VariablesEditor } from './VariablesEditor'
import { PopoverDialog } from '@/components/PopoverDialogs'

export function TestOptions() {
  return (
    <PopoverDialog
      trigger={
        <Button variant="ghost" size="1" color="gray">
          <GearIcon />
          Test options
        </Button>
      }
    >
      <Inset>
        <Tabs.Root defaultValue="loadProfile">
          <Tabs.List
            css={css`
              margin-bottom: var(--space-3);
            `}
          >
            <Tabs.Trigger value="loadProfile">Load profile</Tabs.Trigger>
            <Tabs.Trigger value="thinkTime">Think time</Tabs.Trigger>
            <Tabs.Trigger value="testData">Test data</Tabs.Trigger>
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
              <Tabs.Content value="testData">
                <VariablesEditor />
              </Tabs.Content>
            </Box>
          </ScrollArea>
        </Tabs.Root>
      </Inset>
    </PopoverDialog>
  )
}
