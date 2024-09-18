import { GearIcon } from '@radix-ui/react-icons'
import { Button, Popover, Tabs } from '@radix-ui/themes'
import { css } from '@emotion/react'

import { LoadProfile } from './LoadProfile'
import { ThinkTime } from './ThinkTime'
import { VariablesEditor } from './VariablesEditor'

export function TestOptions() {
  return (
    <Popover.Root>
      <Popover.Trigger>
        <Button variant="ghost" size="1" color="gray">
          <GearIcon />
          Test options
        </Button>
      </Popover.Trigger>
      <Popover.Content
        width="400px"
        size="1"
        side="bottom"
        align="end"
        avoidCollisions
      >
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
          <Tabs.Content value="loadProfile">
            <LoadProfile />
          </Tabs.Content>
          <Tabs.Content value="thinkTime">
            <ThinkTime />
          </Tabs.Content>
          <Tabs.Content value="testData">
            <VariablesEditor />
          </Tabs.Content>
        </Tabs.Root>
      </Popover.Content>
    </Popover.Root>
  )
}
