import { generateScript } from '@/codegen'
import { groupProxyData } from '@/utils/groups'
import {
  selectFilteredRequests,
  selectGeneratorData,
  useGeneratorStore,
} from '@/store/generator'
import { GeneratorFileData } from '@/types/generator'
import { GeneratorFileDataSchema } from '@/schemas/generator'
import { harToProxyData } from '@/utils/harToProxyData'
import { GroupedProxyData } from '@/types'
import { prettify } from '@/utils/prettify'

export async function generateScriptPreview(
  generator: GeneratorFileData,
  recording: GroupedProxyData
) {
  const script = generateScript({
    generator,
    recording,
  })

  return prettify(script)
}

export function saveScript(script: string, fileName: string) {
  window.studio.script.saveScript(script, fileName)
}

export async function exportScript(fileName: string) {
  const generator = selectGeneratorData(useGeneratorStore.getState())
  const filteredRequests = selectFilteredRequests(useGeneratorStore.getState())

  const script = await generateScriptPreview(
    generator,
    groupProxyData(filteredRequests)
  )

  saveScript(script, fileName)
}

export const scriptExists = async (fileName: string) => {
  return window.studio.ui
    .getFiles()
    .then((files) => files.scripts.includes(fileName))
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
