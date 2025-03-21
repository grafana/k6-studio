import { generateScript } from '@/codegen'
import {
  selectFilteredRequests,
  selectGeneratorData,
  useGeneratorStore,
} from '@/store/generator'
import { ProxyData } from '@/types'
import { GeneratorFileData } from '@/types/generator'
import { harToProxyData } from '@/utils/harToProxyData'
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

export const loadGeneratorFile = async (fileName: string) => {
  const generator = await window.studio.generator.loadGenerator(fileName)
  return generator
}

export const loadHarFile = async (fileName: string) => {
  const har = await window.studio.har.openFile(fileName)
  return harToProxyData(har)
}
