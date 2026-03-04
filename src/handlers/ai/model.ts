import { createOpenAI } from '@ai-sdk/openai'
import { LanguageModel } from 'ai'

import { getDecryptedAiKey } from '@/main/settings'

import { GrafanaAssistantLanguageModel } from './grafanaAssistantProvider'

let openAiModel: LanguageModel | null = null
const grafanaAssistantModel = new GrafanaAssistantLanguageModel()

export async function getOpenAiModel() {
  if (openAiModel) {
    return openAiModel
  }

  const apiKey = await getDecryptedAiKey()
  const provider = createOpenAI({ apiKey })
  openAiModel = provider('gpt-5')

  return openAiModel
}

export function resetOpenAiModel() {
  openAiModel = null
}

export function getGrafanaAssistantModel() {
  return grafanaAssistantModel
}
