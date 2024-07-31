import { useState, useEffect } from 'react'
import { Flex } from '@radix-ui/themes'

import { GroupForm } from './GroupForm'
import { DebugControls } from './DebugControls'
import { RecordingControls } from './RecordingButton'
import { View } from '@/components/Layout/View'
import { RequestsSection } from './RequestsSection'
import { selectGroupedProxyData, useRecorderStore } from '@/store/recorder'
import { useSetWindowTitle } from '@/hooks/useSetWindowTitle'
import { useListenProxyData } from '@/hooks/useListenProxyData'

export function Recorder() {
  const [group, setGroup] = useState<string>('Default')
  const groupedProxyData = useRecorderStore(selectGroupedProxyData)

  const setProxyData = useRecorderStore((store) => store.setProxyData)
  const resetProxyData = useRecorderStore((store) => store.resetProxyData)

  useSetWindowTitle('Recorder')
  useListenProxyData(group)

  useEffect(() => {
    return () => {
      resetProxyData()
    }
  }, [setProxyData, resetProxyData])

  return (
    <View title="Recorder" actions={<RecordingControls />}>
      <Flex justify="between" wrap="wrap" gap="2" p="2">
        <GroupForm onChange={setGroup} value={group} />

        <Flex justify="start" align="end" direction="column" gap="2">
          <DebugControls />
        </Flex>
      </Flex>
      <RequestsSection
        groupedProxyData={groupedProxyData}
        noRequestsMessage="Your requests will appear here"
        autoScroll
      />
    </View>
  )
}
