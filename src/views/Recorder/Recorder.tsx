import { useState } from 'react'
import { Flex, Heading, ScrollArea } from '@radix-ui/themes'

import { WebLogView } from '@/components/WebLogView'
import { GroupForm } from './GroupForm'
import { DebugControls } from './DebugControls'
import { RecordingControls } from './RecordingButton'
import { useListenProxyData } from '@/hooks/useListenProxyData'
import { PageHeading } from '@/components/Layout/PageHeading'
import { useRecorderStore } from '@/hooks/useRecorderStore'
import { groupProxyData } from '@/utils/groups'
import { useWindowTitle } from '@/hooks/useWindowTitle'

export function Recorder() {
  const { proxyData } = useRecorderStore()
  const [group, setGroup] = useState<string>('Default')
  useListenProxyData(group)
  const groupedProxyData = groupProxyData(proxyData)
  useWindowTitle('Recorder')

  return (
    <>
      <PageHeading text="Recorder">
        <RecordingControls requests={proxyData} />
      </PageHeading>
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
    </>
  )
}
