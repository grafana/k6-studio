import { useState } from 'react'
import { Box, Flex, Heading, ScrollArea } from '@radix-ui/themes'

import { PageHeading } from '@/components/Layout/PageHeading'
import { WebLogView } from '@/components/WebLogView'
import { useListenProxyData } from '@/hooks/useListenProxyData'
import { useRecorderStore } from '@/store/recorder'
import { useSetWindowTitle } from '@/hooks/useSetWindowTitle'

import { GroupForm } from './GroupForm'
import { DebugControls } from './DebugControls'
import { RecordingControls } from './RecordingButton'
import { selectGroupedProxyData } from '@/store/recorder/selectors'

export function Recorder() {
  const [group, setGroup] = useState<string>('Default')
  useListenProxyData(group)
  const groupedProxyData = useRecorderStore(selectGroupedProxyData)
  useSetWindowTitle('Recorder')

  return (
    <>
      <PageHeading text="Recorder">
        <RecordingControls />
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
