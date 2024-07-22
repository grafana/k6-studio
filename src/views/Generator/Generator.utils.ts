import { generateScript } from '@/codegen'
import { format } from 'prettier/standalone'
import * as prettierPluginBabel from 'prettier/plugins/babel'
// eslint-disable-next-line import/namespace
import * as prettierPluginEStree from 'prettier/plugins/estree'
import { groupProxyData } from '@/utils/groups'
import { useGeneratorStore } from '@/hooks/useGeneratorStore'
import { GeneratorFileData } from '@/types/generator'
import { GeneratorFileDataSchema } from '@/schemas/generator'
import { TestOptions } from '@/types/testOptions'
import { harToProxyData } from '@/utils/harToProxyData'
import { GeneratorState } from '@/hooks/useGeneratorStore/types'

function storeToGeneratorFileData({
  name,
  executor,
  startTime,
  gracefulStop,
  gracefulRampDown,
  stages,
  startVUs,
  vus,
  iterations,
  maxDuration,
  sleepType,
  timing,
  variables,
  recordingPath,
  rules,
  allowList,
}: GeneratorState): GeneratorFileData {
  const loadProfile: TestOptions['loadProfile'] =
    executor === 'ramping-vus'
      ? {
          executor,
          startTime,
          gracefulStop,
          stages,
          startVUs,
          gracefulRampDown,
        }
      : {
          executor,
          startTime,
          gracefulStop,
          vus,
          iterations,
          maxDuration,
        }

  return {
    name,
    version: '0',
    recordingPath,
    options: {
      loadProfile,
      thinkTime: {
        sleepType,
        timing,
      },
    },
    testData: { variables },
    rules,
    allowlist: allowList,
  }
}

export async function exportScript() {
  const generatorState = useGeneratorStore.getState()
  const groupedProxyData = groupProxyData(generatorState.requests)
  const script = generateScript({
    generator: storeToGeneratorFileData(generatorState),
    recording: groupedProxyData,
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
  const generatorFile = storeToGeneratorFileData(useGeneratorStore.getState())

  window.studio.generator.saveGenerator(JSON.stringify(generatorFile, null, 2))
}

export const loadGenerator = async () => {
  const setGeneratorFile = useGeneratorStore.getState().setGeneratorFile
  const generatorFile = await window.studio.generator.loadGenerator()

  if (!generatorFile) return

  const generatorFileData = GeneratorFileDataSchema.safeParse(
    generatorFile.content
  )

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
