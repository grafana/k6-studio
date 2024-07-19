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
import { ExecutorType } from '@/constants/generator'
import { exhaustive } from '@/utils/typescript'

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
  const generatorFile = await window.studio.generator.loadGenerator()

  if (!generatorFile) return

  const generatorFileData = GeneratorFileData.safeParse(generatorFile.content)
  console.log(generatorFileData)

  if (!generatorFileData.success) {
    console.log(!generatorFileData.error)
    return
  }

  setLoadedGeneratorData(generatorFileData.data)
}

const setLoadedGeneratorData = (generatorFileData: GeneratorFileData) => {
  const generatorState = useGeneratorStore.getState()

  // generator
  generatorState.setName(generatorFileData.name)

  // recording
  generatorState.setAllowList(generatorFileData.allowlist)
  // TODO: function to open the specific HAR file
  generatorState.setRecording([], generatorFileData.recordingPath, false)

  // test data
  generatorState.setVariables(generatorFileData.testData.variables)

  // think time
  generatorState.setSleepType(generatorFileData.options.thinkTime.sleepType)
  generatorState.setTiming(generatorFileData.options.thinkTime.timing)

  // load profile
  const loadProfile = generatorFileData.options.loadProfile
  generatorState.setExecutor(loadProfile.executor)
  generatorState.setGracefulStop(loadProfile.gracefulStop)
  generatorState.setStartTime(loadProfile.startTime)
  switch (loadProfile.executor) {
    case ExecutorType.RampingVUs:
      loadProfile.stages.map((stage, index) => {
        generatorState.addStage()
        generatorState.updateStage(index, stage)
      })
      generatorState.setGracefulRampDown(loadProfile.gracefulRampDown)
      generatorState.setStartVUs(loadProfile.startVUs)
      break
    case ExecutorType.SharedIterations:
      generatorState.setIterations(loadProfile.iterations)
      generatorState.setMaxDuration(loadProfile.maxDuration)
      generatorState.setVus(loadProfile.vus)
      break
    default:
      exhaustive(loadProfile)
  }

  // rules
  const rules = generatorFileData.rules
  rules.map((rule) => {
    generatorState.loadRule(rule)
  })
}
