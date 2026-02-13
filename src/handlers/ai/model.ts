import { GrafanaAssistantLanguageModel } from './grafanaAssistantProvider'

const model = new GrafanaAssistantLanguageModel()

export function getAiModel() {
  return model
}
