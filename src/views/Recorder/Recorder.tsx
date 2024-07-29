import { useState } from 'react'
import { Flex, Heading, ScrollArea } from '@radix-ui/themes'

import { PageHeading } from '@/components/Layout/PageHeading'
import { WebLogView } from '@/components/WebLogView'
import { useListenProxyData } from '@/hooks/useListenProxyData'
import { useRecorderStore, selectGroupedProxyData } from '@/store/recorder'
import { useSetWindowTitle } from '@/hooks/useSetWindowTitle'
import { useAutoScroll } from '@/hooks/useAutoScroll'

import { GroupForm } from './GroupForm'
import { DebugControls } from './DebugControls'
import { RecordingControls } from './RecordingButton'

export function Recorder() {
  const [group, setGroup] = useState<string>('Default')
  const groupedProxyData = useRecorderStore(selectGroupedProxyData)
  const contentRef = useAutoScroll(groupedProxyData)
  useListenProxyData(group)
  useSetWindowTitle('Recorder')

  return (
    <>
      <PageHeading text="Recorder">
        <RecordingControls />
      </PageHeading>
      <Flex direction="column" p="2" minHeight="0">
        <Flex justify="between" wrap="wrap" gap="2">
          <GroupForm onChange={setGroup} value={group} />

          <Flex justify="start" align="end" direction="column" gap="2">
            <DebugControls />
          </Flex>
        </Flex>
        <Heading my="4">Requests</Heading>
        <ScrollArea scrollbars="vertical">
          <div ref={contentRef}>
            <WebLogView requests={groupedProxyData} />
          </div>
        </ScrollArea>
      </Flex>
    </>
  )
}
