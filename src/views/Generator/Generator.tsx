import { Allotment } from 'allotment'
import log from 'electron-log/renderer'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useBlocker, useNavigate } from 'react-router-dom'

import { FileNameHeader } from '@/components/FileNameHeader'
import { View } from '@/components/Layout/View'
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

  const showToast = useToast()
  const navigate = useNavigate()

  const file = useCurrentFile('generator')
  const scriptPreview = useScriptPreview(file.path)

  const {
    data: generatorFileData,
    isLoading: isLoadingGenerator,
    error: generatorError,
  } = useLoadGeneratorFile(file.path)

  const {
    data: recording,
    isLoading: isLoadingRecording,
    error: harError,
  } = useLoadHarFile(generatorFileData?.recordingPath)

  const saveFile = useSaveFile({
    menuItems: ['save', 'save-as'],
    location: { type: 'file', path: file.path },
    content: () => ({
      type: 'generator' as const,
      data: selectGeneratorData(useGeneratorStore.getState()),
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

  const isLoading = isLoadingGenerator || isLoadingRecording

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
      subTitle={<FileNameHeader file={file} isDirty={isDirty} />}
      actions={
        <GeneratorControls
          onSave={handleSaveGenerator}
          isDirty={isDirty}
          script={scriptPreview}
        />
      }
      loading={isLoading}
    >
      <Allotment defaultSizes={[1, 1]}>
        <Allotment.Pane minSize={580}>
          <Allotment vertical>
            <Allotment.Pane minSize={200}>
              <GeneratorTabs
                script={scriptPreview}
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
