import { generateScript } from '@/codegen'
import {
  selectFilteredRequests,
  selectGeneratorData,
  useGeneratorStore,
} from '@/store/generator'
import { GeneratorFileData } from '@/types/generator'
import { GeneratorFileDataSchema } from '@/schemas/generator'
import { harToProxyData } from '@/utils/harToProxyData'
import { ProxyData } from '@/types'
import { prettify } from '@/utils/prettify'

export async function generateScriptPreview(
  generator: GeneratorFileData,
  recording: ProxyData[]
) {
  const script = generateScript({
    generator,
    recording,
  })

  return prettify(script)
}

export async function exportScript(fileName: string) {
  const generator = selectGeneratorData(useGeneratorStore.getState())
  const filteredRequests = selectFilteredRequests(useGeneratorStore.getState())

  const script = await generateScriptPreview(generator, filteredRequests)

  await window.studio.script.saveScript(script, fileName)
}

export const writeGeneratorToFile = (
  fileName: string,
  generatorData: GeneratorFileData
) => {
  return window.studio.generator.saveGenerator(
    JSON.stringify(generatorData, null, 2),
    fileName
  )
}

export const loadGeneratorFile = async (fileName: string) => {
  const generatorFile = await window.studio.generator.loadGenerator(fileName)
  return GeneratorFileDataSchema.parse(generatorFile.content)
}

export const loadHarFile = async (fileName: string) => {
  const harFile = await window.studio.har.openFile(fileName)
  return harToProxyData(harFile.content)
}
