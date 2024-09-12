import { Allotment } from 'allotment'
import { Button } from '@radix-ui/themes'
import { Outlet, useNavigate } from 'react-router-dom'

import {
  useGeneratorStore,
  selectHasRecording,
  selectGeneratorData,
} from '@/store/generator'
import { View } from '@/components/Layout/View'
import { exportScript } from './Generator.utils'
import { GeneratorSidebar } from './GeneratorSidebar'
import { TestRuleContainer } from './TestRuleContainer'
import { Allowlist } from './Allowlist'
import { RecordingSelector } from './RecordingSelector'
import {
  useGeneratorParams,
  useIsGeneratorDirty,
  useLoadGeneratorFile,
  useLoadHarFile,
  useSaveGeneratorFile,
} from './Generator.hooks'
import { useEffect } from 'react'
import { useToast } from '@/store/ui/useToast'
import { getRoutePath } from '@/routeMap'

export function Generator() {
  const hasRecording = useGeneratorStore(selectHasRecording)

  const setGeneratorFile = useGeneratorStore((store) => store.setGeneratorFile)
  const generatorState = useGeneratorStore(selectGeneratorData)

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

      navigate(getRoutePath('home'))
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

  return (
    <View
      title="Generator"
      actions={
        <>
          <RecordingSelector />
          <Allowlist />
          <Button
            disabled={!isDirty}
            onClick={() => saveGenerator(generatorState)}
          >
            Save
          </Button>
          {hasRecording && (
            <Button onClick={exportScript}>Export script</Button>
          )}
        </>
      }
      loading={isLoading}
    >
      <Allotment defaultSizes={[3, 1]}>
        <Allotment.Pane minSize={400}>
          <Allotment vertical defaultSizes={[1, 1]}>
            <Allotment.Pane minSize={300}>
              <TestRuleContainer />
            </Allotment.Pane>
            <Allotment.Pane minSize={300}>
              <Outlet />
            </Allotment.Pane>
          </Allotment>
        </Allotment.Pane>
        <Allotment.Pane minSize={300} visible={hasRecording}>
          <GeneratorSidebar />
        </Allotment.Pane>
      </Allotment>
    </View>
  )
}
