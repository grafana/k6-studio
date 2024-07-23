import { useState } from 'react'
import { Box, Flex, Heading, ScrollArea } from '@radix-ui/themes'

import { PageHeading } from '@/components/Layout/PageHeading'
import { WebLogView } from '@/components/WebLogView'
import { groupProxyData } from '@/utils/groups'
import { useListenProxyData } from '@/hooks/useListenProxyData'
import { useRecorderStore } from '@/hooks/useRecorderStore'
import { useSetWindowTitle } from '@/hooks/useSetWindowTitle'

import { GroupForm } from './GroupForm'
import { DebugControls } from './DebugControls'
import { RecordingControls } from './RecordingButton'

export function Recorder() {
  const { proxyData } = useRecorderStore()
  const [group, setGroup] = useState<string>('Default')
  useListenProxyData(group)
  useSetWindowTitle('Recorder')

  const groupedProxyData = groupProxyData(proxyData)

  return (
    <>
      <PageHeading text="Recorder">
        <RecordingControls requests={proxyData} />
      </PageHeading>
      <Box p="2">
        <Flex justify="between" wrap="wrap" gap="2">
          <GroupForm onChange={setGroup} value={group} />

          <Flex justify="start" align="end" direction="column" gap="2">
            <DebugControls />
          </Flex>
        </Flex>
        <Heading my="4">Requests</Heading>
        <ScrollArea scrollbars="vertical">
          <WebLogView requests={groupedProxyData} />
        </ScrollArea>
      </Box>
    </>
  )
}
