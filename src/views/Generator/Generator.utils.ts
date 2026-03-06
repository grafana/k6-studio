import invariant from 'tiny-invariant'

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
  const result = await window.studio.file.open(fileName)

  invariant(result.type === 'generator', 'Expected generator content')

  return result.data
}

export const loadRecording = async (filePath: string) => {
  const result = await window.studio.file.open(filePath)

  invariant(result.type === 'recording', 'Expected recording content')

  return result.data.requests
}
