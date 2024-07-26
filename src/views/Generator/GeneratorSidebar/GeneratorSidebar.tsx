import { WebLogView } from '@/components/WebLogView'
import { ProxyData } from '@/types'
import { Box, Flex, ScrollArea, Tabs } from '@radix-ui/themes'
import { ScriptPreview } from './ScriptPreview'
import { groupProxyData } from '@/utils/groups'
import { selectHasRecording, useGeneratorStore } from '@/store/generator'
import { useEffect, useState } from 'react'
import { RulePreview } from '../RulePreview/RulePreview'

interface GeneratorSidebarProps {
  requests: ProxyData[]
}

export function GeneratorSidebar({ requests }: GeneratorSidebarProps) {
  const [tab, setTab] = useState('requests')

  const hasRecording = useGeneratorStore(selectHasRecording)
  const groupedProxyData = groupProxyData(requests)
  const selectedRuleId = useGeneratorStore((store) => store.selectedRuleId)

  useEffect(() => {
    if (selectedRuleId === null) {
      setTab((currentTab) =>
        currentTab === 'rule-preview' ? 'requests' : currentTab
      )
      return
    }

    setTab('rule-preview')
  }, [selectedRuleId])

  return (
    <Flex direction="column" height="100%" minHeight="0">
      <Tabs.Root
        value={tab}
        onValueChange={(value) => setTab(value)}
        style={{
          height: '100%',
        }}
      >
        <Tabs.List>
          <Tabs.Trigger value="requests">
            Requests ({requests.length})
          </Tabs.Trigger>
          <Tabs.Trigger value="script" disabled={!hasRecording}>
            Script preview
          </Tabs.Trigger>
          {selectedRuleId !== null && (
            <Tabs.Trigger value="rule-preview">Rule preview</Tabs.Trigger>
          )}
        </Tabs.List>
        {selectedRuleId !== null && (
          <Tabs.Content value="rule-preview" style={{ height: '100%' }}>
            <ScrollArea>
              <Box p="2" mb="5">
                <RulePreview />
              </Box>
            </ScrollArea>
          </Tabs.Content>
        )}
        <Tabs.Content
          value="requests"
          style={{
            height: '100%',
          }}
        >
          <ScrollArea scrollbars="vertical">
            <Box p="2">
              <WebLogView requests={groupedProxyData} />
            </Box>
          </ScrollArea>
        </Tabs.Content>
        <Tabs.Content value="script" style={{ height: '100%' }}>
          <ScriptPreview />
        </Tabs.Content>
      </Tabs.Root>
    </Flex>
  )
}
