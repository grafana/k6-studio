import { Allotment } from 'allotment'
import log from 'electron-log/renderer'
import { useCallback, useEffect, useState } from 'react'
import { useBlocker } from 'react-router-dom'

import { FileNameHeader } from '@/components/FileNameHeader'
import { View } from '@/components/Layout/View'
import { HttpRequestDetails } from '@/components/WebLogView/HttpRequestDetails'
import { FileContent } from '@/handlers/file/types'
import { useSaveRequested } from '@/hooks/useSaveRequested'
import { useGeneratorStore, selectGeneratorData } from '@/store/generator'
import { useToast } from '@/store/ui/useToast'
import { StudioFile, ProxyData } from '@/types'
import { GeneratorFileData } from '@/types/generator'

import {
  useIsGeneratorDirty,
  useScriptPreview,
  useLoadRecording,
} from './Generator.hooks'
import { GeneratorControls } from './GeneratorControls'
import { GeneratorTabs } from './GeneratorTabs'
import { TestRuleContainer } from './TestRuleContainer'
import { UnsavedChangesDialog } from './UnsavedChangesDialog'

interface GeneratorProps {
  file: StudioFile
  data: GeneratorFileData
  onSave: (content: FileContent, saveAs?: boolean) => void | Promise<void>
}

export function Generator({ file, data, onSave }: GeneratorProps) {
  const setGeneratorFile = useGeneratorStore((store) => store.setGeneratorFile)
  const [selectedRequest, setSelectedRequest] = useState<ProxyData | null>(null)

  const showToast = useToast()

  const {
    data: recording,
    isLoading: isLoadingRecording,
    error: harError,
  } = useLoadRecording(data.recordingPath)

  const isLoading = isLoadingRecording

  const isDirty = useIsGeneratorDirty(data)

  const [isAppClosing, setIsAppClosing] = useState(false)

  const blocker = useBlocker(({ historyAction }) => {
    // Don't block navigation when redirecting home from invalid generator
    // TODO(router): Action enum is not exported from react-router-dom
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    return isDirty && historyAction !== 'REPLACE'
  })

  const { preview, error } = useScriptPreview(file.path)

  useEffect(() => {
    setGeneratorFile(data, recording)
  }, [setGeneratorFile, data, recording])

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

  const handleSaveGenerator = useCallback(
    (payload?: { saveAs?: boolean }) => {
      const generator = selectGeneratorData(useGeneratorStore.getState())

      return onSave({ type: 'generator', data: generator }, payload?.saveAs)
    },
    [onSave]
  )

  useSaveRequested(handleSaveGenerator)

  const handleSaveGeneratorDialog = async () => {
    await handleSaveGenerator()
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
      subTitle={<FileNameHeader file={file} isDirty={isDirty} />}
      actions={
        <GeneratorControls
          file={file}
          isDirty={isDirty}
          preview={preview}
          error={error}
          onSave={handleSaveGenerator}
        />
      }
      loading={isLoading}
    >
      <Allotment defaultSizes={[1, 1]}>
        <Allotment.Pane minSize={580}>
          <Allotment vertical>
            <Allotment.Pane minSize={200}>
              <GeneratorTabs
                preview={preview}
                error={error}
                selectedRequest={selectedRequest}
                onSelectRequest={setSelectedRequest}
              />
            </Allotment.Pane>
            <Allotment.Pane minSize={200}>
              <TestRuleContainer />
            </Allotment.Pane>
          </Allotment>
        </Allotment.Pane>

        <Allotment.Pane minSize={300} visible={selectedRequest !== null}>
          <HttpRequestDetails
            selectedRequest={selectedRequest}
            onSelectRequest={setSelectedRequest}
          />
        </Allotment.Pane>
      </Allotment>
      <UnsavedChangesDialog
        open={blocker.state === 'blocked' || (isAppClosing && isDirty)}
        onSave={handleSaveGeneratorDialog}
        onDiscard={handleDiscardGeneratorDialog}
        onCancel={handleCancelGeneratorDialog}
      />
    </View>
  )
}
