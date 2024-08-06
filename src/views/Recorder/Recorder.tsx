import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Flex } from '@radix-ui/themes'
import { PlayIcon, StopIcon } from '@radix-ui/react-icons'

import { GroupForm } from './GroupForm'
import { DebugControls } from './DebugControls'
import { View } from '@/components/Layout/View'
import { RequestsSection } from './RequestsSection'
import { useSetWindowTitle } from '@/hooks/useSetWindowTitle'
import { useListenProxyData } from '@/hooks/useListenProxyData'
import { groupProxyData } from '@/utils/groups'
import { startRecording, stopRecording } from './Recorder.utils'
import { proxyDataToHar } from '@/utils/proxyDataToHar'
import { getRoutePath } from '@/routeMap'

export function Recorder() {
  const [group, setGroup] = useState<string>('Default')
  const { proxyData, resetProxyData } = useListenProxyData(group)
  const groupedProxyData = groupProxyData(proxyData)
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const autoStart = searchParams.get('autoStart') !== null
  useSetWindowTitle('Recorder')

  const handleStartRecording = useCallback(async () => {
    resetProxyData()
    setIsLoading(true)

    await startRecording()

    setIsLoading(false)
    setIsRecording(true)
  }, [resetProxyData])

  async function handleStopRecording() {
    stopRecording()
    setIsRecording(false)

    if (proxyData.length === 0) {
      return
    }

    const har = proxyDataToHar(groupedProxyData)
    const filePath = await window.studio.har.saveFile(
      JSON.stringify(har, null, 4)
    )

    navigate(
      `${getRoutePath('recordingPreviewer', { path: filePath })}?discardable`
    )
  }

  useEffect(() => {
    if (autoStart) {
      handleStartRecording()
    }
  }, [autoStart, handleStartRecording])

  return (
    <View
      title="Recorder"
      actions={
        <Button
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          loading={isLoading}
          color={isRecording ? 'red' : 'green'}
        >
          {isRecording ? (
            <>
              <StopIcon /> Stop recording
            </>
          ) : (
            <>
              <PlayIcon /> Start recording
            </>
          )}
        </Button>
      }
    >
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
