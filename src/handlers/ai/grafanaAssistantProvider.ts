import { LanguageModelV2, LanguageModelV2CallOptions } from '@ai-sdk/provider'

/**
 * Placeholder implementation of the Grafana Assistant language model.
 * The actual A2A integration will be implemented in a follow-up PR.
 */
export class GrafanaAssistantLanguageModel implements LanguageModelV2 {
  readonly specificationVersion = 'v2' as const
  readonly provider = 'grafana-assistant'
  readonly modelId = 'grafana_assistant_k6_studio'
  readonly supportedUrls = {}

  doGenerate(
    _options: LanguageModelV2CallOptions
  ): ReturnType<LanguageModelV2['doGenerate']> {
    throw new Error('not implemented')
  }

  doStream(
    _options: LanguageModelV2CallOptions
  ): ReturnType<LanguageModelV2['doStream']> {
    throw new Error('not implemented')
  }
}
