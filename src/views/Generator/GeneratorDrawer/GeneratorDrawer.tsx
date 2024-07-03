import { Box, Tabs } from '@radix-ui/themes'
import { RequestFilters } from './RequestFilters'
import { VariablesEditor } from './VariablesEditor'

export function GeneratorDrawer() {
  return (
    <Box height="100%">
      <Tabs.Root defaultValue="requestFilters">
        <Tabs.List>
          <Tabs.Trigger value="rule">Rule</Tabs.Trigger>
          <Tabs.Trigger value="loadProfile">Load profile</Tabs.Trigger>
          <Tabs.Trigger value="thresholds">Thresholds</Tabs.Trigger>
          <Tabs.Trigger value="thinkTime">Think time</Tabs.Trigger>
          <Tabs.Trigger value="testData">Test data</Tabs.Trigger>
          <Tabs.Trigger value="requestFilters">Request filters</Tabs.Trigger>
          <Tabs.Trigger value="variables">Variables</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="rule">Rule content</Tabs.Content>
        <Tabs.Content value="loadProfile">Load profile content</Tabs.Content>
        <Tabs.Content value="thresholds">Thresholds content</Tabs.Content>
        <Tabs.Content value="thinkTime">Think time content</Tabs.Content>
        <Tabs.Content value="testData">Test data content</Tabs.Content>
        <Tabs.Content value="requestFilters">
          <RequestFilters />
        </Tabs.Content>
        <Tabs.Content value="variables">
          <VariablesEditor />
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  )
}
