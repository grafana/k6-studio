import { type ComponentProps } from 'react'
import { Box, ScrollArea, Tabs } from '@radix-ui/themes'

import { RequestFilters } from './RequestFilters'
import { LoadProfile } from './LoadProfile'

export function GeneratorDrawer() {
  return (
    <Box height="100%">
      <Tabs.Root
        defaultValue="requestFilters"
        style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        <Tabs.List style={{ flex: '1 0 auto' }}>
          <Tabs.Trigger value="rule">Rule</Tabs.Trigger>
          <Tabs.Trigger value="loadProfile">Load profile</Tabs.Trigger>
          <Tabs.Trigger value="thresholds">Thresholds</Tabs.Trigger>
          <Tabs.Trigger value="thinkTime">Think time</Tabs.Trigger>
          <Tabs.Trigger value="testData">Test data</Tabs.Trigger>
          <Tabs.Trigger value="requestFilters">Request filters</Tabs.Trigger>
        </Tabs.List>
        <div style={{ flex: '0 1 auto', height: '100%', overflow: 'hidden' }}>
          <ScrollableTabsContent value="rule">
            Rule content
          </ScrollableTabsContent>
          <ScrollableTabsContent value="loadProfile">
            <LoadProfile />
          </ScrollableTabsContent>
          <ScrollableTabsContent value="thresholds">
            Thresholds content
          </ScrollableTabsContent>
          <ScrollableTabsContent value="thinkTime">
            Think time content
          </ScrollableTabsContent>
          <ScrollableTabsContent value="testData">
            Test data content
          </ScrollableTabsContent>
          <ScrollableTabsContent value="requestFilters">
            <RequestFilters />
          </ScrollableTabsContent>
        </div>
      </Tabs.Root>
    </Box>
  )
}

const ScrollableTabsContent = ({
  children,
  value,
  ...props
}: ComponentProps<typeof Tabs.Content>) => {
  return (
    <Tabs.Content style={{ height: '100%' }} value={value} {...props}>
      <ScrollArea style={{ height: '100%' }}>{children}</ScrollArea>
    </Tabs.Content>
  )
}
