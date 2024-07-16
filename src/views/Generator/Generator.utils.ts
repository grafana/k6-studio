import { ProxyData } from '@/types'
import { TestRule } from '@/types/rules'
import { generateScript } from '@/codegen'
import { format } from 'prettier/standalone'
import * as prettierPluginBabel from 'prettier/plugins/babel'
// eslint-disable-next-line import/namespace
import * as prettierPluginEStree from 'prettier/plugins/estree'
import { groupProxyData } from '@/utils/groups'
import { useGeneratorStore } from '@/hooks/useGeneratorStore'
import {
  GeneratorOptions,
  GeneratorTestData,
  GeneratorFile,
} from '@/types/generator'

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

  window.studio.generator.saveGenerator(JSON.stringify(generatorFile, null, 2))
}
