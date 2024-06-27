import * as Label from '@radix-ui/react-label'
import { Box, Flex, Tabs, TextField } from '@radix-ui/themes'

interface GeneratorDrawerProps {
  filter: string
  onFilterChange: (filters: string) => void
}

export function GeneratorDrawer({
  filter,
  onFilterChange,
}: GeneratorDrawerProps) {
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
        </Tabs.List>
        <Tabs.Content value="rule">Rule content</Tabs.Content>
        <Tabs.Content value="loadProfile">Load profile content</Tabs.Content>
        <Tabs.Content value="thresholds">Thresholds content</Tabs.Content>
        <Tabs.Content value="thinkTime">Think time content</Tabs.Content>
        <Tabs.Content value="testData">Test data content</Tabs.Content>
        <Tabs.Content value="requestFilters">
          <Flex gap="2" p="2" align="center" width="100%">
            <Label.Root htmlFor="requestFilterInput">
              Allow requests containing
            </Label.Root>
            <TextField.Root
              style={{ flex: 1 }}
              id="requestFilterInput"
              value={filter}
              onChange={(e) => onFilterChange(e.target.value)}
              placeholder="Type part of the request URL to filter requests"
            />
          </Flex>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  )
}
