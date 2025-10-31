import { createOpenAI } from '@ai-sdk/openai'
import { LanguageModel } from 'ai'

import { getDecryptedAiKey } from '@/main/settings'

let model: LanguageModel | null = null

export async function setupAiModel() {
  if (model) {
    return model
  }

  const apiKey = await getDecryptedAiKey()
  const provider = createOpenAI({ apiKey })
  model = provider('gpt-4.1')

  return model
}

export function resetAiModel() {
  model = null
}
