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

  await window.studio.files.save({
    location: {
      type: 'untitled',
      name: fileName,
    },
    content: {
      type: 'script',
      content: script,
    },
  })
}

export const loadGeneratorFile = async (filePath: string) => {
  return window.studio.generator.loadGenerator(filePath)
}

export const loadHarFile = async (fileName: string) => {
  const har = await window.studio.har.openFile(fileName)
  return harToProxyData(har)
}
