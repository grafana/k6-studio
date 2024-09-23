import { useCallback, useEffect, useMemo, useState } from 'react'
import { useBlocker, useLocation, useNavigate } from 'react-router-dom'
import { Box, Button, Flex, Text } from '@radix-ui/themes'
import { DiscIcon, PlusCircledIcon, StopIcon } from '@radix-ui/react-icons'
import { Allotment } from 'allotment'

import { View } from '@/components/Layout/View'
import { RequestsSection } from './RequestsSection'
import { useListenProxyData } from '@/hooks/useListenProxyData'
import {
  startRecording,
  stopRecording,
  useDebouncedProxyData,
} from './Recorder.utils'
import { proxyDataToHar } from '@/utils/proxyDataToHar'
import { getRoutePath } from '@/routeMap'
import { Details } from '@/components/WebLogView/Details'
import { Group, ProxyData } from '@/types'
import { ConfirmNavigationDialog } from './ConfirmNavigationDialog'
import { RecorderState } from './types'
import { useToast } from '@/store/ui/useToast'
import TextSpinner from '@/components/TextSpinner/TextSpinner'
import { DEFAULT_GROUP_NAME } from '@/constants'

const INITIAL_GROUPS: Group[] = [
  {
    id: crypto.randomUUID(),
    name: DEFAULT_GROUP_NAME,
  },
]

export function Recorder() {
  const [selectedRequest, setSelectedRequest] = useState<ProxyData | null>(null)

  const [groups, setGroups] = useState<Group[]>(() => INITIAL_GROUPS)

  const group = useMemo(() => groups[groups.length - 1], [groups])

  const { proxyData, resetProxyData } = useListenProxyData(group?.id)
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

      // Temporary solution to avoid having to update `proxyDataToHar`.
      const grouped = proxyData.map((data) => {
        const group = groups.find((g) => g.id === data.group) ?? {
          id: DEFAULT_GROUP_NAME,
          name: DEFAULT_GROUP_NAME,
        }

        return {
          ...data,
          group: group.name,
        }
      })

      const har = proxyDataToHar(grouped)
      const fileName = await window.studio.har.saveFile(
        JSON.stringify(har, null, 4)
      )

      return fileName
    } finally {
      setRecorderState('idle')
    }
  }, [groups, proxyData])

  async function handleStopRecording() {
    stopRecording()
  }

  function handleCancelNavigation() {
    blocker.reset?.()
  }

  async function handleConfirmNavigation() {
    stopRecording()

    await validateAndSaveHarFile()

    blocker.proceed?.()
  }

  function handleUpdateGroup(newGroup: Group) {
    setGroups((groups) => {
      return groups.map((group) =>
        group.id === newGroup.id ? newGroup : group
      )
    })
  }

  function handleCreateGroup(name: string) {
    setGroups((groups) => createGroupOrEditLast(groups, proxyData, name))
  }

  function handleResetRecording() {
    resetProxyData()
    setGroups(INITIAL_GROUPS)
  }

  useEffect(() => {
    if (autoStart) {
      handleStartRecording()
    }
  }, [autoStart, handleStartRecording])

  useEffect(() => {
    return window.studio.browser.onBrowserClosed(async () => {
      const fileName = await validateAndSaveHarFile()

      if (fileName === null) {
        return
      }

      showToast({
        title: 'Recording stopped',
        status: 'success',
      })

      navigate(
        getRoutePath('recordingPreviewer', {
          fileName: encodeURIComponent(fileName),
        }),
        {
          state: { discardable: true },
        }
      )
    })
  }, [validateAndSaveHarFile, showToast])

  return (
    <View
      title="Recorder"
      actions={
        <>
          {recorderState === 'idle' && (
            <Button disabled={isLoading} onClick={handleStartRecording}>
              <DiscIcon /> Start recording
            </Button>
          )}
          {recorderState !== 'idle' && (
            <>
              {isLoading && <TextSpinner text="Starting" />}
              <Button
                disabled={isLoading}
                color="red"
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
            <div css={{ flexGrow: 0, minHeight: 0 }}>
              <RequestsSection
                proxyData={debouncedProxyData}
                noRequestsMessage={
                  <>
                    <Text color="gray" size="1">
                      Once you start the recording, requests will appear here
                    </Text>
                    <Button disabled={isLoading} onClick={handleStartRecording}>
                      <DiscIcon /> Start recording
                    </Button>
                  </>
                }
                showNoRequestsMessage={recorderState === 'idle'}
                selectedRequestId={selectedRequest?.id}
                autoScroll
                groups={groups}
                activeGroup={group?.id}
                onSelectRequest={setSelectedRequest}
                onUpdateGroup={handleUpdateGroup}
                resetProxyData={handleResetRecording}
              />
            </div>
            {recorderState === 'recording' && (
              <Box width="200px" p="2">
                <Button
                  size="2"
                  variant="ghost"
                  ml="2"
                  onClick={() => handleCreateGroup(`Group ${groups.length}`)}
                >
                  <PlusCircledIcon />
                  Create group
                </Button>
              </Box>
            )}
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

// Don't create a new group if the last one is empty,
// instead switch to editing it's name
function createGroupOrEditLast(
  groups: Group[],
  proxyData: ProxyData[],
  name: string
) {
  const lastGroup = groups[groups.length - 1]
  const isLastGroupEmpty =
    lastGroup && proxyData.every((data) => data.group !== lastGroup.id)

  if (isLastGroupEmpty) {
    return groups.map((group) => {
      if (lastGroup?.id === group.id) {
        return {
          ...group,
          isEditing: true,
        }
      }

      return group
    })
  }

  return [
    ...groups,
    {
      id: crypto.randomUUID(),
      name,
      isEditing: true,
    },
  ]
}
