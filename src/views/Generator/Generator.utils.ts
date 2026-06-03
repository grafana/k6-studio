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
  const content = await window.studio.fs.openFile(filePath)

  if (content.type !== 'generator') {
    throw new Error(`Expected generator content, got ${content.type}`)
  }

  return content
}

export const loadHarFile = async (fileName: string) => {
  const content = await window.studio.fs.openFile(fileName)

  if (content.type !== 'recording') {
    throw new Error(`Expected recording content, got ${content.type}`)
  }

  return harToProxyData(content.data)
}
