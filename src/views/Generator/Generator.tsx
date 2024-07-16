import { Allotment } from 'allotment'
import { Button } from '@radix-ui/themes'
import { useEffect } from 'react'

import { exportScript, saveScript } from './Generator.utils'
import { PageHeading } from '@/components/Layout/PageHeading'
import { harToProxyData } from '@/utils/harToProxyData'
import { GeneratorDrawer } from './GeneratorDrawer'
import { GeneratorSidebar } from './GeneratorSidebar'
import { useGeneratorStore } from '@/hooks/useGeneratorStore'
import { TestRuleContainer } from './TestRuleContainer'
import { AllowList } from './AllowList/AllowList'
import {
  GeneratorFile,
  GeneratorOptions,
  GeneratorTestData,
} from '@/types/generator'

export function Generator() {
  const {
    rules,
    setRecording,
    resetRecording,
    filteredRequests,
    setRecordingPath,
  } = useGeneratorStore()

  const hasRecording = filteredRequests.length > 0

  useEffect(() => {
    return () => {
      resetRecording()
    }
  }, [resetRecording])

  const handleImport = async () => {
    const harFile = await window.studio.har.openFile()
    if (!harFile) return

    const proxyData = harToProxyData(harFile.content)
    setRecording(proxyData)
    setRecordingPath(harFile.path)
  }

  const handleExport = async () => {
    const script = await exportScript(filteredRequests, rules)

    saveScript(script)
  }

  const saveGenerator = async () => {
    const generatorState = useGeneratorStore.getState()
    const options: GeneratorOptions = {
      loadProfile: {
        executor: generatorState.executor,
        startTime: generatorState.startTime,
        gracefulStop: generatorState.gracefulStop,
        stages: generatorState.stages,
        gracefulRampDown: generatorState.gracefulRampDown,
        startVUs: generatorState.startVUs,
        iterations: generatorState.iterations,
        maxDuration: generatorState.maxDuration,
        vus: generatorState.vus,
      },
      thinkTime: {
        sleepType: generatorState.sleepType,
        timing: generatorState.timing,
      },
    }
    const generatorTestData: GeneratorTestData = {
      variables: generatorState.variables,
    }

    const generatorFile: GeneratorFile = {
      name: generatorState.name,
      version: '0',
      recordingPath: generatorState.recordingPath,
      options: options,
      testData: generatorTestData,
      rules: generatorState.rules,
      allowlist: generatorState.allowList,
    }

    window.studio.generator.saveGenerator(
      JSON.stringify(generatorFile, null, 2)
    )
  }

  return (
    <>
      <PageHeading text="Generator">
        <Button onClick={saveGenerator}>Save</Button>
        <Button onClick={handleImport}>Import HAR</Button>
        <AllowList />
        <Button onClick={handleExport} disabled={!hasRecording}>
          Export script
        </Button>
      </PageHeading>
      <Allotment defaultSizes={[3, 1]}>
        <Allotment.Pane minSize={400}>
          <Allotment vertical defaultSizes={[1, 1]}>
            <Allotment.Pane minSize={300}>
              <TestRuleContainer />
            </Allotment.Pane>
            <Allotment.Pane minSize={300}>
              <GeneratorDrawer />
            </Allotment.Pane>
          </Allotment>
        </Allotment.Pane>
        <Allotment.Pane minSize={300}>
          <GeneratorSidebar requests={filteredRequests} />
        </Allotment.Pane>
      </Allotment>
    </>
  )
}
