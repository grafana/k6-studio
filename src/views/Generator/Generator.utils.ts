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
  scriptPath: string,
  generator: GeneratorFileData,
  recording: ProxyData[]
) {
  const script = generateScript({
    generator,
    recording,
    scriptPath,
  })

  return prettify(script)
}

export async function generateScriptFromGenerator(scriptPath: string) {
  const generator = selectGeneratorData(useGeneratorStore.getState())
  const filteredRequests = selectFilteredRequests(useGeneratorStore.getState())

  const script = await generateScriptPreview(
    scriptPath,
    generator,
    filteredRequests
  )

  return script
}

export const loadGeneratorFile = async (filePath: string) => {
  const generator = await window.studio.generator.loadGenerator(filePath)
  return generator
}

export const loadHarFile = async (fileName: string) => {
  const har = await window.studio.har.openFile(fileName)
  return harToProxyData(har)
}
