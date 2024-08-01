import { generateScript } from '@/codegen'
import { format } from 'prettier/standalone'
import * as prettierPluginBabel from 'prettier/plugins/babel'
// eslint-disable-next-line import/namespace
import * as prettierPluginEStree from 'prettier/plugins/estree'
import { groupProxyData } from '@/utils/groups'
import { selectGeneratorData, useGeneratorStore } from '@/store/generator'
import { GeneratorFileData } from '@/types/generator'
import { GeneratorFileDataSchema } from '@/schemas/generator'
import { harToProxyData } from '@/utils/harToProxyData'
import { GroupedProxyData } from '@/types'

export async function generateScriptPreview(
  generator: GeneratorFileData,
  recording: GroupedProxyData
) {
  const script = generateScript({
    generator,
    recording,
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

export async function exportScript() {
  const generator = selectGeneratorData(useGeneratorStore.getState())
  const recording = groupProxyData(useGeneratorStore.getState().requests)

  const script = await generateScriptPreview(generator, recording)

  saveScript(script)
}

export const saveGenerator = (fileName: string) => {
  const generatorFile = selectGeneratorData(useGeneratorStore.getState())

  return window.studio.generator.saveGenerator(
    JSON.stringify(generatorFile, null, 2),
    fileName
  )
}

export const loadGenerator = async (path?: string) => {
  const setGeneratorFile = useGeneratorStore.getState().setGeneratorFile
  const generatorFile = await window.studio.generator.loadGenerator(path)

  if (!generatorFile) return

  const generatorFileData = GeneratorFileDataSchema.safeParse(
    generatorFile.content
  )

  if (!generatorFileData.success) {
    console.log(!generatorFileData.error)
    return
  }

  const harFile = generatorFileData.data.recordingPath
    ? await window.studio.har.openFile(generatorFileData.data.recordingPath)
    : undefined

  // TODO: we need to better handle errors scenarios
  const recording = harFile ? harToProxyData(harFile.content) : []

  setGeneratorFile(generatorFileData.data, recording)
}
