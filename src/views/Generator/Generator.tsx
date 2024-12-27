import { Allotment } from 'allotment'
import { useEffect, useState } from 'react'
import { useBlocker, useNavigate } from 'react-router-dom'
import { Box, ScrollArea } from '@radix-ui/themes'

import {
  useGeneratorStore,
  selectGeneratorData,
  selectSelectedRule,
} from '@/store/generator'
import { View } from '@/components/Layout/View'
import { GeneratorSidebar } from './GeneratorSidebar'
import { TestRuleContainer } from './TestRuleContainer'
import {
  useGeneratorParams,
  useIsGeneratorDirty,
  useLoadGeneratorFile,
  useLoadHarFile,
  useSaveGeneratorFile,
} from './Generator.hooks'
import { GeneratorControls } from './GeneratorControls'
import { useToast } from '@/store/ui/useToast'
import { getRoutePath } from '@/routeMap'
import { UnsavedChangesDialog } from './UnsavedChangesDialog'
import { RuleEditor } from './RuleEditor'
import { getFileNameWithoutExtension } from '@/utils/file'
import log from 'electron-log/renderer'

export function Generator() {
  const selectedRule = useGeneratorStore(selectSelectedRule)

  const setGeneratorFile = useGeneratorStore((store) => store.setGeneratorFile)

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

  const handleSaveGenerator = () => {
    const generator = selectGeneratorData(useGeneratorStore.getState())
    return saveGenerator(generator)
  }

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
      subTitle={getFileNameWithoutExtension(fileName)}
      actions={
        <GeneratorControls onSave={handleSaveGenerator} isDirty={isDirty} />
      }
      loading={isLoading}
    >
      <Allotment defaultSizes={[3, 2]}>
        <Allotment.Pane minSize={400}>
          <Allotment vertical defaultSizes={[1, 1]}>
            <Allotment.Pane minSize={300}>
              <TestRuleContainer />
            </Allotment.Pane>
            <Allotment.Pane minSize={300} visible={selectedRule !== undefined}>
              {selectedRule !== undefined && (
                <ScrollArea scrollbars="vertical">
                  <Box p="3">
                    <RuleEditor rule={selectedRule} />
                  </Box>
                </ScrollArea>
              )}
            </Allotment.Pane>
          </Allotment>
        </Allotment.Pane>
        <Allotment.Pane minSize={400}>
          <GeneratorSidebar />
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
