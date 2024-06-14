import { useEffect, useRef, useState } from 'react'
import { Flex, Heading } from '@radix-ui/themes'
import { WebLogView } from '@/components/WebLogView'
import { GroupedProxyData, ProxyData } from '@/types'
import { GroupForm } from './GroupForm'
import { proxyDataToHar } from '@/utils/proxyDataToHar'
import { DebugControls } from './DebugControls'
import { mergeRequestsById } from './Recorder.utils'
import { RecordingButton } from './RecordingButton'
import { SaveHarDialog } from './SaveHarDialog'

export function Recorder() {
  const [requests, setRequests] = useState<GroupedProxyData>({})
  const [group, setGroup] = useState<string>('Default')
  const [showHarSaveDialog, setShowHarSaveDialog] = useState(false)
  const groupRef = useRef(group)

  useEffect(() => {
    // Create ref to avoid creating multiple listeners
    // for proxyData
    groupRef.current = group
  }, [group])

  function saveHarToFile() {
    const har = proxyDataToHar(requests)
    window.studio.har.saveFile(JSON.stringify(har, null, 4))
  }

  useEffect(() => {
    window.studio.proxy.onProxyData((data) => {
      setRequests((prev) =>
        mergeRequestsIntoGroup(prev, data, groupRef.current)
      )
    })
  }, [])

  return (
    <>
      <Flex justify="between" wrap="wrap" gap="2">
        <GroupForm onChange={setGroup} value={group} />
        <Flex
          width="50%"
          justify="start"
          align="end"
          direction="column"
          gap="2"
        >
          <RecordingButton
            onStop={() => setShowHarSaveDialog(true)}
            onStart={() => setRequests({})}
          />
          <DebugControls />
        </Flex>
      </Flex>
      <Heading my="4">Requests</Heading>
      <WebLogView requests={requests} />
      <SaveHarDialog
        onConfirm={saveHarToFile}
        open={showHarSaveDialog}
        onOpenChange={setShowHarSaveDialog}
      />
    </>
  )
}

function mergeRequestsIntoGroup(
  groups: GroupedProxyData,
  requests: ProxyData,
  group: string
) {
  const current = groups[group] || []
  const mergedRequests = mergeRequestsById([...current, requests])

  return {
    ...groups,
    [group]: mergedRequests,
  }
}
