import { GearIcon, StopIcon } from '@radix-ui/react-icons'
import { Button } from '@radix-ui/themes'
import log from 'electron-log/renderer'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useBlocker, useNavigate } from 'react-router-dom'

import { View } from '@/components/Layout/View'
import TextSpinner from '@/components/TextSpinner/TextSpinner'
import { DEFAULT_GROUP_NAME } from '@/constants'
import { useListenBrowserEvent } from '@/hooks/useListenBrowserEvent'
import { useListenProxyData } from '@/hooks/useListenProxyData'
import { useSettings } from '@/hooks/useSettings'
import { getRoutePath } from '@/routeMap'
import { useStudioUIStore } from '@/store/ui'
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
import { RecordingContext } from './RecordingContext'
import { RecordingInspector } from './RecordingInspector'
import { RequestLog } from './RequestLog'
import { RecorderState } from './types'

const INITIAL_GROUPS: Group[] = [
  {
    id: crypto.randomUUID(),
    name: DEFAULT_GROUP_NAME,
  },
]

export function Recorder() {
  const { data: settings } = useSettings()

  const [startUrl, setStartUrl] = useState<string>()
  const [groups, setGroups] = useState<Group[]>(() => INITIAL_GROUPS)
  const openSettingsDialog = useStudioUIStore(
    (state) => state.openSettingsDialog
  )

  const group = useMemo(() => groups[groups.length - 1], [groups])

  const { proxyData, resetProxyData } = useListenProxyData(group?.id)
  const [recorderState, setRecorderState] = useState<RecorderState>('idle')
  const showToast = useToast()

  const browserEvents = useListenBrowserEvent()

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

      const har = proxyDataToHar(grouped, browserEvents)
      const prefix = getHostNameFromURL(startUrl) ?? 'Recording'
      const fileName = await window.studio.har.saveFile(har, prefix)

      return fileName
    } finally {
      setRecorderState('idle')
    }
  }, [groups, proxyData, startUrl, browserEvents])

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
    return window.studio.browser.onBrowserLaunchFailed(() => {
      setRecorderState('idle')
      showToast({
        title: 'Failed to launch browser',
        description: 'Please check your browser path and try again.',
        action: (
          <Button onClick={() => openSettingsDialog('recorder')}>
            <GearIcon />
            Open settings
          </Button>
        ),
        status: 'error',
      })
    })
  }, [openSettingsDialog, showToast])

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

  return (
    <RecordingContext recording>
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
        {recorderState === 'idle' && (
          <EmptyState isLoading={isLoading} onStart={handleStartRecording} />
        )}

        {recorderState !== 'idle' &&
          settings?.recorder.enableBrowserRecorder && (
            <RecordingInspector
              recorderState={recorderState}
              groups={groups}
              requests={debouncedProxyData}
              browserEvents={browserEvents}
              onCreateGroup={handleCreateGroup}
              onUpdateGroup={handleUpdateGroup}
              onResetRecording={handleResetRecording}
            />
          )}

        {recorderState !== 'idle' &&
          !settings?.recorder.enableBrowserRecorder && (
            <RequestLog
              recorderState={recorderState}
              groups={groups}
              requests={debouncedProxyData}
              onUpdateGroup={handleUpdateGroup}
              onResetRecording={handleResetRecording}
              onCreateGroup={handleCreateGroup}
            />
          )}

        <ConfirmNavigationDialog
          open={blocker.state === 'blocked'}
          state={recorderState}
          onCancel={handleCancelNavigation}
          onStopRecording={handleConfirmNavigation}
        />
      </View>
    </RecordingContext>
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
