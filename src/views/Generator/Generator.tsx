import { Allotment } from 'allotment'
import { useEffect } from 'react'
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
import { GeneratorControls } from './GeneraterControls'
import { useToast } from '@/store/ui/useToast'
import { getRoutePath } from '@/routeMap'
import { UnsavedChangesDialog } from './UnsavedChangesDialog'
import { RuleEditor } from './RuleEditor'

export function Generator() {
  const selectedRule = useGeneratorStore(selectSelectedRule)

  const setGeneratorFile = useGeneratorStore((store) => store.setGeneratorFile)

  const showToast = useToast()
  const navigate = useNavigate()

  const { fileName } = useGeneratorParams()
  const fileNameWithoutLeadingGenerator = fileName.replace(/^Generator - /, '')

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

  const blocker = useBlocker(() => isDirty)

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

      navigate(getRoutePath('home'), { replace: true })
    }
  }, [generatorError, showToast, navigate])

  useEffect(() => {
    if (harError) {
      showToast({
        title: 'Failed to har file',
        status: 'error',
        description: 'Select another recording from top menu',
      })
    }
  }, [harError, showToast])

  const handleSaveGenerator = () => {
    const generator = selectGeneratorData(useGeneratorStore.getState())
    return saveGenerator(generator)
  }

  return (
    <View
      title={`Generator - ${fileNameWithoutLeadingGenerator}`}
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
        open={blocker.state === 'blocked'}
        onSave={() => {
          handleSaveGenerator().then(() => blocker.proceed?.())
        }}
        onDiscard={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      />
    </View>
  )
}
