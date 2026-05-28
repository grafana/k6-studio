import log from 'electron-log/renderer'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useBlocker, useNavigate } from 'react-router-dom'

import { FileNameHeader } from '@/components/FileNameHeader'
import { View } from '@/components/Layout/View'
import { Group, Panel, Separator } from '@/components/primitives/ResizablePanel'
import { HttpRequestDetails } from '@/components/WebLogView/HttpRequestDetails'
import { useCurrentFile } from '@/hooks/useCurrentFile'
import { useSaveFile } from '@/hooks/useSaveFile'
import { useScriptPreview } from '@/hooks/useScriptPreview'
import { getRoutePath, getViewPath } from '@/routeMap'
import { useGeneratorStore, selectGeneratorData } from '@/store/generator'
import { useToast } from '@/store/ui/useToast'
import { ProxyData } from '@/types'
import { queryClient } from '@/utils/query'

import {
  useGeneratorLayout,
  useIsGeneratorDirty,
  useLoadGeneratorFile,
  useLoadHarFile,
} from './Generator.hooks'
import { GeneratorControls } from './GeneratorControls'
import { GeneratorTabs } from './GeneratorTabs'
import { TestRuleContainer } from './TestRuleContainer'
import { UnsavedChangesDialog } from './UnsavedChangesDialog'

export function Generator() {
  const setGeneratorFile = useGeneratorStore((store) => store.setGeneratorFile)
  const [selectedRequest, setSelectedRequest] = useState<ProxyData | null>(null)

  const recordingPath = useGeneratorStore((store) => store.recordingPath)
  const setRecordingPath = useGeneratorStore((store) => store.setRecordingPath)

  const setRecording = useGeneratorStore((store) => store.setRecording)
  const setRecordingError = useGeneratorStore(
    (store) => store.setRecordingError
  )

  const showToast = useToast()
  const navigate = useNavigate()

  const file = useCurrentFile('generator')
  const scriptPreview = useScriptPreview(file.path)

  const { mainLayout, sidebarLayout, detailsLayout } = useGeneratorLayout()

  const {
    data: generatorFileData,
    isLoading: isLoadingGenerator,
    error: generatorError,
  } = useLoadGeneratorFile(file.path)

  const {
    data: recording,
    isLoading: isLoadingRecording,
    error: harError,
  } = useLoadHarFile(recordingPath)

  const isLoading = isLoadingGenerator || isLoadingRecording

  const saveFile = useSaveFile({
    menuItems: {
      save: !isLoading,
      saveAs: !isLoading,
    },
    location: { type: 'file', path: file.path },
    content: () => ({
      type: 'generator' as const,
      data: selectGeneratorData(useGeneratorStore.getState()),
      isExternal: generatorFileData?.isExternal ?? false,
    }),
    filters: [{ name: 'Generator', extensions: ['k6g'] }],
    onSave: async (location) => {
      await queryClient.invalidateQueries({
        queryKey: ['generator', location.path],
      })

      if (location.path !== file.path) {
        navigate(getViewPath('generator', location.path), { replace: true })
      }
    },
    onError: (error) => {
      showToast({
        title: 'Failed to save generator',
        status: 'error',
        description: error.message,
      })

      log.error(error)
    },
  })

  const isDirty = useIsGeneratorDirty(file.path)
  const isDirtyRef = useRef(isDirty)

  const [isAppClosing, setIsAppClosing] = useState(false)

  const blocker = useBlocker(({ historyAction }) => {
    // Don't block navigation when redirecting home from invalid generator
    // TODO(router): Action enum is not exported from react-router-dom
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    return isDirty && historyAction !== 'REPLACE'
  })

  useEffect(() => {
    if (!generatorFileData) {
      return
    }

    setGeneratorFile(generatorFileData.data)
  }, [generatorFileData, setGeneratorFile])

  useEffect(() => {
    if (recording === undefined) {
      return
    }

    setRecording(recording)
    setRecordingError(harError)
  }, [harError, recording, setRecording, setRecordingError])

  useEffect(() => {
    if (generatorError) {
      showToast({
        title: 'Failed to load generator',
        status: 'error',
      })
      log.error(generatorError)
      navigate(getRoutePath('home'), { replace: true })
    }
  }, [generatorError, showToast, navigate])

  useEffect(() => {
    if (harError) {
      showToast({
        title: 'Failed to load recording',
        status: 'error',
        description: 'Select another recording in the sidebar',
      })
      log.error(harError)
    }
  }, [harError, showToast])

  useEffect(() => {
    return window.studio.app.onApplicationClose(() => {
      if (isDirty || blocker.state === 'blocked') {
        setIsAppClosing(true)
        return
      }
      window.studio.app.closeApplication()
    })
  })

  useEffect(() => {
    isDirtyRef.current = isDirty
  }, [isDirty])

  const handleSaveGenerator = useCallback(() => {
    return saveFile({ saveAs: false })
  }, [saveFile])

  const handleChangeRecording = (newPath: string) => {
    setSelectedRequest(null)
    setRecordingPath(newPath)
  }

  const handleSaveGeneratorDialog = async () => {
    const location = await handleSaveGenerator()

    if (location === undefined) {
      setIsAppClosing(false)

      return
    }

    if (isAppClosing) {
      return window.studio.app.closeApplication()
    }

    blocker.proceed?.()
  }

  const handleDiscardGeneratorDialog = () => {
    if (isAppClosing) {
      return window.studio.app.closeApplication()
    }

    blocker.proceed?.()
  }

  const handleCancelGeneratorDialog = () => {
    if (isAppClosing) {
      return window.studio.app.closeApplication()
    }

    blocker.reset?.()
  }

  return (
    <View
      title="Generator"
      subTitle={
        <FileNameHeader
          file={file}
          isDirty={isDirty}
          canRename={!generatorFileData?.isExternal}
        />
      }
      actions={
        <GeneratorControls
          onSave={handleSaveGenerator}
          isDirty={isDirty}
          script={scriptPreview}
        />
      }
      loading={isLoading}
    >
      <Group {...sidebarLayout}>
        <Panel id="main" minSize={580}>
          <Group orientation="vertical" {...mainLayout}>
            <Panel id="preview" minSize={200}>
              <GeneratorTabs
                script={scriptPreview}
                selectedRequest={selectedRequest}
                onSelectRequest={setSelectedRequest}
                onChangeRecording={handleChangeRecording}
              />
            </Panel>
            <Separator />
            <Panel id="rules" minSize={200}>
              <TestRuleContainer />
            </Panel>
          </Group>
        </Panel>
        {selectedRequest && (
          <>
            <Separator />
            <Panel id="request-details" minSize={300}>
              <HttpRequestDetails
                layout={detailsLayout}
                selectedRequest={selectedRequest}
                onSelectRequest={setSelectedRequest}
              />
            </Panel>
          </>
        )}
      </Group>
      <UnsavedChangesDialog
        open={blocker.state === 'blocked' || (isAppClosing && isDirty)}
        onSave={handleSaveGeneratorDialog}
        onDiscard={handleDiscardGeneratorDialog}
        onCancel={handleCancelGeneratorDialog}
      />
    </View>
  )
}
