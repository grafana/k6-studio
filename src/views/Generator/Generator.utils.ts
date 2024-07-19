import { ProxyData } from '@/types'
import { TestRule } from '@/schemas/rules'
import { generateScript } from '@/codegen'
import { format } from 'prettier/standalone'
import * as prettierPluginBabel from 'prettier/plugins/babel'
// eslint-disable-next-line import/namespace
import * as prettierPluginEStree from 'prettier/plugins/estree'
import { groupProxyData } from '@/utils/groups'
import { useGeneratorStore } from '@/hooks/useGeneratorStore'
import { GeneratorFileData } from '@/schemas/generator'
import { TestOptions } from '@/schemas/testOptions'
import { TestData } from '@/schemas/testData'
import { harToProxyData } from '@/utils/harToProxyData'

export async function exportScript(recording: ProxyData[], rules: TestRule[]) {
  const groupedProxyData = groupProxyData(recording)
  const script = generateScript({
    recording: groupedProxyData,
    rules,
  })
  const prettifiedScript = await format(script, {
    parser: 'babel',
    plugins: [prettierPluginBabel, prettierPluginEStree],
  })

  return prettifiedScript
}

export function saveScript(script: string) {
  window.studio.script.saveScript(script)
}

export const saveGenerator = () => {
  const generatorState = useGeneratorStore.getState()
  const options: TestOptions = {
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
  const generatorTestData: TestData = {
    variables: generatorState.variables,
  }

  const generatorFile: GeneratorFileData = {
    name: generatorState.name,
    version: '0',
    recordingPath: generatorState.recordingPath,
    options: options,
    testData: generatorTestData,
    rules: generatorState.rules,
    allowlist: generatorState.allowList,
  }

  window.studio.generator.saveGenerator(JSON.stringify(generatorFile, null, 2))
}

export const loadGenerator = async () => {
  const setGeneratorFile = useGeneratorStore.getState().setGeneratorFile
  const generatorFile = await window.studio.generator.loadGenerator()

  if (!generatorFile) return

  const generatorFileData = GeneratorFileData.safeParse(generatorFile.content)

  if (!generatorFileData.success) {
    console.log(!generatorFileData.error)
    return
  }

  const harFile = await window.studio.har.openFile(
    generatorFileData.data.recordingPath
  )

  // TODO: we need to better handle errors scenarios
  const recording = harFile ? harToProxyData(harFile.content) : []

  setGeneratorFile(generatorFileData.data, recording)
}
