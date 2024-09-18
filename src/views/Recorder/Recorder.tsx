import { useCallback, useEffect, useState } from 'react'
import { useBlocker, useLocation, useNavigate } from 'react-router-dom'
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
import { ConfirmNavigationDialog } from './ConfirmNavigationDialog'
import { RecorderState } from './types'
import { useToast } from '@/store/ui/useToast'
import TextSpinner from '@/components/TextSpinner/TextSpinner'

export function Recorder() {
  const [selectedRequest, setSelectedRequest] = useState<ProxyData | null>(null)
  const [group, setGroup] = useState('Default')
  const { proxyData, resetProxyData } = useListenProxyData(group)
  const [recorderState, setRecorderState] = useState<RecorderState>('idle')
  const showToast = useToast()

  // Debounce the proxy data to avoid disappearing static asset requests
  // when recording
  const debouncedProxyData = useDebouncedProxyData(proxyData)

  const navigate = useNavigate()
  const { state } = useLocation()
  const blocker = useBlocker(
    recorderState === 'starting' || recorderState === 'recording'
  )

  const autoStart = Boolean(state?.autoStart)
  useSetWindowTitle('Recorder')

  const isLoading = recorderState === 'starting' || recorderState === 'saving'

  const handleStartRecording = useCallback(async () => {
    try {
      resetProxyData()
      setRecorderState('starting')

      await startRecording()

      setRecorderState('recording')
    } catch {
      setRecorderState('idle')
      showToast({
        title: 'There was an error starting the recording',
        status: 'error',
      })
    }
  }, [resetProxyData, showToast])

  const validateAndSaveHarFile = useCallback(async () => {
    try {
      setRecorderState('saving')

      if (proxyData.length === 0) {
        return null
      }

      const har = proxyDataToHar(proxyData)
      const fileName = await window.studio.har.saveFile(
        JSON.stringify(har, null, 4)
      )

      return fileName
    } finally {
      setRecorderState('idle')
    }
  }, [proxyData])

  async function handleStopRecording() {
    stopRecording()

    const fileName = await validateAndSaveHarFile()

    if (fileName === null) {
      return
    }

    navigate(
      getRoutePath('recordingPreviewer', {
        fileName: encodeURIComponent(fileName),
      }),
      {
        state: { discardable: true },
      }
    )
  }

  function handleCancelNavigation() {
    blocker.reset?.()
  }

  async function handleConfirmNavigation() {
    stopRecording()

    await validateAndSaveHarFile()

    blocker.proceed?.()
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
          {recorderState === 'idle' && (
            <Button
              disabled={isLoading}
              color="red"
              onClick={handleStartRecording}
            >
              <DiscIcon /> Start recording
            </Button>
          )}
          {recorderState !== 'idle' && (
            <>
              {isLoading && <TextSpinner text="Starting" />}
              <Button
                disabled={isLoading}
                color="orange"
                onClick={handleStopRecording}
              >
                <StopIcon /> Stop recording
              </Button>
            </>
          )}
        </>
      }
    >
      <Allotment defaultSizes={[1, 1]}>
        <Allotment.Pane minSize={200}>
          <Flex direction="column" height="100%">
            <Flex justify="between" wrap="wrap" gap="2" p="2" flexShrink="0">
              <GroupForm
                currentGroup={group}
                proxyData={proxyData}
                onChange={setGroup}
              />

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

      <ConfirmNavigationDialog
        open={blocker.state === 'blocked'}
        state={recorderState}
        onCancel={handleCancelNavigation}
        onStopRecording={handleConfirmNavigation}
      />
    </View>
  )
}
