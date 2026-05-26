import log from 'electron-log/renderer'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useBlocker, useNavigate } from 'react-router-dom'

import { FileNameHeader } from '@/components/FileNameHeader'
import { View } from '@/components/Layout/View'
import { Group, Panel, Separator } from '@/components/primitives/ResizablePanel'
import { HttpRequestDetails } from '@/components/WebLogView/HttpRequestDetails'
import { useSaveFile } from '@/hooks/useSaveFile'
import { useScriptPreview } from '@/hooks/useScriptPreview'
import { getViewPath } from '@/routeMap'
import { useGeneratorStore, selectGeneratorData } from '@/store/generator'
import { useToast } from '@/store/ui/useToast'
import { StudioFile, ProxyData } from '@/types'
import { GeneratorFileData } from '@/types/generator'

import {
  useGeneratorLayout,
  useIsGeneratorDirty,
  useLoadHarFile,
} from './Generator.hooks'
import { GeneratorControls } from './GeneratorControls'
import { GeneratorTabs } from './GeneratorTabs'
import { TestRuleContainer } from './TestRuleContainer'
import { UnsavedChangesDialog } from './UnsavedChangesDialog'

interface GeneratorProps {
  file: StudioFile
  initialData: GeneratorFileData
}

export function Generator({ file, initialData }: GeneratorProps) {
  const setGeneratorFile = useGeneratorStore((store) => store.setGeneratorFile)
  const [selectedRequest, setSelectedRequest] = useState<ProxyData | null>(null)
  const [savedData, setSavedData] = useState<GeneratorFileData>(initialData)

  const showToast = useToast()
  const navigate = useNavigate()

  const filePath = file.path
  const scriptPreview = useScriptPreview(filePath)

  const { mainLayout, sidebarLayout, detailsLayout } = useGeneratorLayout()

  const {
    data: recording,
    isLoading: isLoadingRecording,
    error: harError,
  } = useLoadHarFile(initialData.recordingPath)

  const saveFile = useSaveFile({
    menuItems: {
      save: true,
      saveAs: true,
    },
    location: { type: 'file', path: filePath },
    content: () => ({
      type: 'generator' as const,
      data: selectGeneratorData(useGeneratorStore.getState()),
      isExternal: false,
    }),
    filters: [{ name: 'Generator', extensions: ['k6g'] }],
    onSave: (location) => {
      if (location.path === filePath) {
        setSavedData(selectGeneratorData(useGeneratorStore.getState()))
      } else {
        navigate(getViewPath(location.path), { replace: true })
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

  const isLoading = isLoadingRecording

  const isDirty = useIsGeneratorDirty(savedData)
  const isDirtyRef = useRef(isDirty)

  const [isAppClosing, setIsAppClosing] = useState(false)

  const blocker = useBlocker(({ historyAction }) => {
    // Don't block navigation when redirecting home from invalid generator
    // TODO(router): Action enum is not exported from react-router-dom
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    return isDirty && historyAction !== 'REPLACE'
  })

  useEffect(() => {
    setGeneratorFile(initialData, recording)
  }, [setGeneratorFile, initialData, recording])

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
        />
      }
      actions={
        <GeneratorControls
          file={file}
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
