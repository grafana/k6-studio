import { PlusCircledIcon, StopIcon } from '@radix-ui/react-icons'
import { Box, Button, Flex } from '@radix-ui/themes'
import { Allotment } from 'allotment'
import log from 'electron-log/renderer'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useBlocker, useNavigate } from 'react-router-dom'

import { ButtonWithTooltip } from '@/components/ButtonWithTooltip'
import { EmptyMessage } from '@/components/EmptyMessage'
import { View } from '@/components/Layout/View'
import TextSpinner from '@/components/TextSpinner/TextSpinner'
import { Details } from '@/components/WebLogView/Details'
import { DEFAULT_GROUP_NAME } from '@/constants'
import { useListenProxyData } from '@/hooks/useListenProxyData'
import { getRoutePath } from '@/routeMap'
import { useToast } from '@/store/ui/useToast'
import { Group, ProxyData } from '@/types'
import { proxyDataToHar } from '@/utils/proxyDataToHar'

import { ConfirmNavigationDialog } from './ConfirmNavigationDialog'
import { EmptyState } from './EmptyState'
import {
  getHostNameFromURL,
  startRecording,
  stopRecording,
  useDebouncedProxyData,
} from './Recorder.utils'
import { RequestsSection } from './RequestsSection'
import { RecorderState } from './types'

const INITIAL_GROUPS: Group[] = [
  {
    id: crypto.randomUUID(),
    name: DEFAULT_GROUP_NAME,
  },
]

export function Recorder() {
  const [selectedRequest, setSelectedRequest] = useState<ProxyData | null>(null)
  const [startUrl, setStartUrl] = useState<string>()
  const [groups, setGroups] = useState<Group[]>(() => INITIAL_GROUPS)

  const group = useMemo(() => groups[groups.length - 1], [groups])

  const { proxyData, resetProxyData } = useListenProxyData(group?.id)
  const [recorderState, setRecorderState] = useState<RecorderState>('idle')
  const showToast = useToast()

  // Debounce the proxy data to avoid disappearing static asset requests
  // when recording
  const debouncedProxyData = useDebouncedProxyData(proxyData)

  const navigate = useNavigate()
  const blocker = useBlocker(
    recorderState === 'starting' || recorderState === 'recording'
  )

  const isLoading = recorderState === 'starting' || recorderState === 'saving'

  const handleStartRecording = useCallback(
    async (url?: string) => {
      setStartUrl(url)
      try {
        resetProxyData()
        setRecorderState('starting')
        await startRecording(url)
      } catch (error) {
        setRecorderState('idle')
        showToast({
          title: 'Failed to start recording',
          status: 'error',
        })
        log.error(error)
      }
    },
    [resetProxyData, showToast]
  )

  // Set the state to 'recording' when the first data arrives.
  // This allows us to show loading indicator while browser loads.
  useEffect(() => {
    if (recorderState === 'starting' && proxyData.length > 0) {
      setRecorderState('recording')
    }
  }, [recorderState, proxyData.length])

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
      const prefix = getHostNameFromURL(startUrl) ?? 'Recording'
      const fileName = await window.studio.har.saveFile(har, prefix)

      return fileName
    } finally {
      setRecorderState('idle')
    }
  }, [groups, proxyData, startUrl])

  function handleStopRecording() {
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
  }, [validateAndSaveHarFile, showToast, navigate])

  const noDataElement = useMemo(() => {
    if (recorderState === 'idle') {
      return <EmptyState isLoading={isLoading} onStart={handleStartRecording} />
    }

    if (recorderState === 'starting') {
      return <EmptyMessage message="Requests will appear here" />
    }
  }, [recorderState, isLoading, handleStartRecording])

  return (
    <View
      title="Recorder"
      actions={
        recorderState !== 'idle' && (
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
        )
      }
    >
      <Allotment defaultSizes={[1, 1]}>
        <Allotment.Pane minSize={200}>
          <Flex direction="column" height="100%">
            <div css={{ flexGrow: 0, minHeight: 0 }}>
              <RequestsSection
                proxyData={debouncedProxyData}
                noDataElement={noDataElement}
                selectedRequestId={selectedRequest?.id}
                autoScroll
                groups={groups}
                onSelectRequest={setSelectedRequest}
                onUpdateGroup={handleUpdateGroup}
                resetProxyData={handleResetRecording}
              />
            </div>
            {recorderState === 'recording' && (
              <Box width="200px" p="2">
                <ButtonWithTooltip
                  size="2"
                  variant="ghost"
                  ml="2"
                  onClick={() => handleCreateGroup(`Group ${groups.length}`)}
                  tooltip="Groups are used to organize specific steps in your recording. After you create a group, any further requests will be added to it."
                >
                  <PlusCircledIcon />
                  Create group
                </ButtonWithTooltip>
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
