import { Allotment } from 'allotment'
import log from 'electron-log/renderer'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useBlocker, useNavigate } from 'react-router-dom'
import useKeyboardJs from 'react-use/lib/useKeyboardJs'

import { FileNameHeader } from '@/components/FileNameHeader'
import { View } from '@/components/Layout/View'
import { HttpRequestDetails } from '@/components/WebLogView/HttpRequestDetails'
import { getRoutePath } from '@/routeMap'
import { useGeneratorStore, selectGeneratorData } from '@/store/generator'
import { useToast } from '@/store/ui/useToast'
import { ProxyData } from '@/types'
import { getFileNameWithoutExtension } from '@/utils/file'

import {
  useGeneratorParams,
  useIsGeneratorDirty,
  useLoadGeneratorFile,
  useLoadHarFile,
  useSaveGeneratorFile,
} from './Generator.hooks'
import { GeneratorControls } from './GeneratorControls'
import { GeneratorTabs } from './GeneratorTabs'
import { TestRuleContainer } from './TestRuleContainer'
import { UnsavedChangesDialog } from './UnsavedChangesDialog'

export function Generator() {
  const setGeneratorFile = useGeneratorStore((store) => store.setGeneratorFile)
  const [selectedRequest, setSelectedRequest] = useState<ProxyData | null>(null)

  const showToast = useToast()
  const navigate = useNavigate()

  const { fileName } = useGeneratorParams()

  const {
    data: generatorFileData,
    isLoading: isLoadingGenerator,
    error: generatorError,
  } = useLoadGeneratorFile(fileName)

  const {
    data: recording,
    isLoading: isLoadingRecording,
    error: harError,
  } = useLoadHarFile(generatorFileData?.recordingPath)

  const { mutateAsync: saveGenerator } = useSaveGeneratorFile(fileName)

  const isLoading = isLoadingGenerator || isLoadingRecording

  const isDirty = useIsGeneratorDirty(fileName)
  const isDirtyRef = useRef(isDirty)

  const [isAppClosing, setIsAppClosing] = useState(false)

  const [, onSaveKeyPress] = useKeyboardJs(['command + s', 'ctrl + s'])

  const blocker = useBlocker(({ historyAction }) => {
    // Don't block navigation when redirecting home from invalid generator
    // TODO(router): Action enum is not exported from react-router-dom
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    return isDirty && historyAction !== 'REPLACE'
  })

  useEffect(() => {
    if (!generatorFileData) return
    setGeneratorFile(generatorFileData, recording)
  }, [setGeneratorFile, generatorFileData, recording])

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
    const generator = selectGeneratorData(useGeneratorStore.getState())
    return saveGenerator(generator)
  }, [saveGenerator])

  useEffect(() => {
    ;(async () => {
      if (onSaveKeyPress && isDirtyRef.current === true) {
        await handleSaveGenerator()
      }
    })()
  }, [handleSaveGenerator, onSaveKeyPress])

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
      subTitle={
        <FileNameHeader
          file={{
            fileName,
            displayName: getFileNameWithoutExtension(fileName),
            type: 'generator',
          }}
          isDirty={isDirty}
        />
      }
      actions={
        <GeneratorControls
          onSave={handleSaveGenerator}
          isDirty={isDirty}
          onChangeRecording={() => setSelectedRequest(null)}
        />
      }
      loading={isLoading}
    >
      <Allotment defaultSizes={[1, 1]}>
        <Allotment.Pane minSize={580}>
          <Allotment vertical>
            <Allotment.Pane minSize={200}>
              <GeneratorTabs
                fileName={fileName}
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
