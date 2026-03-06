import { generateScript } from '@/codegen'
import {
  selectFilteredRequests,
  selectGeneratorData,
  useGeneratorStore,
} from '@/store/generator'
import { ProxyData } from '@/types'
import { GeneratorFileData } from '@/types/generator'
import { prettify } from '@/utils/prettify'

export async function generateScriptPreview(
  scriptPath: string,
  generator: GeneratorFileData,
  recording: ProxyData[]
) {
  const script = generateScript({
    scriptPath,
    generator,
    recording,
  })

  return prettify(script)
}

export async function exportScript(filePath: string) {
  const generator = selectGeneratorData(useGeneratorStore.getState())
  const filteredRequests = selectFilteredRequests(useGeneratorStore.getState())

  const script = await generateScriptPreview(
    filePath,
    generator,
    filteredRequests
  )

  await window.studio.script.saveScript(script, filePath)
}

export const loadGeneratorFile = async (fileName: string) => {
  const generator = await window.studio.generator.loadGenerator(fileName)
  return generator
}

export const loadRecording = async (filePath: string) => {
  const data = await window.studio.har.openFile(filePath)
  return data.requests
}
