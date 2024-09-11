import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, Flex } from '@radix-ui/themes'
import { DiscIcon, StopIcon } from '@radix-ui/react-icons'
import { Allotment } from 'allotment'

import { GroupForm } from './GroupForm'
import { DebugControls } from './DebugControls'
import { View } from '@/components/Layout/View'
import { RequestsSection } from './RequestsSection'
import { useSetWindowTitle } from '@/hooks/useSetWindowTitle'
import { useListenProxyData } from '@/hooks/useListenProxyData'
import {
  startRecording,
  stopRecording,
  useDebouncedProxyData,
} from './Recorder.utils'
import { proxyDataToHar } from '@/utils/proxyDataToHar'
import { getRoutePath } from '@/routeMap'
import { Details } from '@/components/WebLogView/Details'
import { ProxyData } from '@/types'
import { useToast } from '@/store/ui/useToast'
import TextSpinner from '@/components/TextSpinner/TextSpinner'

export function Recorder() {
  const [selectedRequest, setSelectedRequest] = useState<ProxyData | null>(null)
  const [group, setGroup] = useState<string>('Default')
  const { proxyData, resetProxyData } = useListenProxyData(group)
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const showToast = useToast()

  // Debounce the proxy data to avoid disappearing static asset requests
  // when recording
  const debouncedProxyData = useDebouncedProxyData(proxyData)

  const navigate = useNavigate()
  const { state } = useLocation()
  const autoStart = Boolean(state?.autoStart)
  useSetWindowTitle('Recorder')

  const handleStartRecording = useCallback(async () => {
    try {
      resetProxyData()
      setIsLoading(true)

      await startRecording()

      setIsLoading(false)
      setIsRecording(true)

      showToast({
        title: 'Recording started',
        status: 'success',
      })
    } catch (err) {
      showToast({
        title: 'There was an error starting the recording',
        status: 'error',
      })
      setIsLoading(false)
      setIsRecording(false)
    }
  }, [resetProxyData, showToast])

  const validateAndSaveHarFile = useCallback(async () => {
    setIsRecording(false)

    if (proxyData.length === 0) {
      return
    }

    const har = proxyDataToHar(proxyData)
    const fileName = await window.studio.har.saveFile(
      JSON.stringify(har, null, 4)
    )

    navigate(
      getRoutePath('recordingPreviewer', {
        fileName: encodeURIComponent(fileName),
      }),
      {
        state: { discardable: true },
      }
    )
  }, [proxyData, navigate])

  function handleStopRecording() {
    stopRecording()
    validateAndSaveHarFile()
  }

  useEffect(() => {
    if (autoStart) {
      handleStartRecording()
    }
  }, [autoStart, handleStartRecording])

  useEffect(() => {
    return window.studio.browser.onBrowserClosed(() => {
      validateAndSaveHarFile()
      showToast({
        title: 'Recording stopped',
        status: 'success',
      })
    })
  }, [validateAndSaveHarFile, showToast])

  return (
    <View
      title="Recorder"
      actions={
        <>
          {isLoading && <TextSpinner text="Starting" />}
          <Button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={isLoading}
            color={isRecording ? 'red' : 'orange'}
          >
            {isRecording ? (
              <>
                <StopIcon /> Stop recording
              </>
            ) : (
              <>
                <DiscIcon /> Start recording
              </>
            )}
          </Button>
        </>
      }
    >
      <Allotment defaultSizes={[1, 1]}>
        <Allotment.Pane minSize={200}>
          <Flex direction="column" height="100%">
            <Flex justify="between" wrap="wrap" gap="2" p="2" flexShrink="0">
              <GroupForm onChange={setGroup} value={group} />

              <DebugControls />
            </Flex>
            <div css={{ flexGrow: 1, minHeight: 0 }}>
              <RequestsSection
                proxyData={debouncedProxyData}
                noRequestsMessage="Your requests will appear here"
                selectedRequestId={selectedRequest?.id}
                autoScroll
                activeGroup={group}
                onSelectRequest={setSelectedRequest}
                resetProxyData={resetProxyData}
              />
            </div>
          </Flex>
        </Allotment.Pane>
        {selectedRequest !== null && (
          <Allotment.Pane minSize={300}>
            <Details
              selectedRequest={selectedRequest}
              onSelectRequest={setSelectedRequest}
            />
          </Allotment.Pane>
        )}
      </Allotment>
    </View>
  )
}
