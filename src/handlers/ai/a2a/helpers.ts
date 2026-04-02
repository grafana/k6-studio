import type { LanguageModelV2CallOptions } from '@ai-sdk/provider'

import type { RemoteToolDefinition } from '../tools'

import type { A2ASessionConfig } from './types'

export function buildA2AHeaders(
  config: A2ASessionConfig
): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.bearerToken}`,
    'X-App-Source': 'k6-studio',
  }
}

export function extractChatId(options: LanguageModelV2CallOptions): string {
  const grafanaOpts = options.providerOptions?.grafanaAssistant as
    | Record<string, unknown>
    | undefined

  const chatId = grafanaOpts?.chatId as string | undefined

  if (!chatId) {
    throw new Error(
      'GrafanaAssistantProvider requires providerOptions.grafanaAssistant.chatId'
    )
  }

  return chatId
}

export function extractLatestUserText(
  prompt: LanguageModelV2CallOptions['prompt']
): string {
  const lastUserMsg = prompt.findLast((msg) => msg.role === 'user')
  if (!lastUserMsg) return ''

  return lastUserMsg.content
    .filter(
      (
        part
      ): part is Extract<
        (typeof lastUserMsg.content)[number],
        { type: 'text' }
      > => part.type === 'text'
    )
    .map((part) => part.text)
    .join('\n')
}

export function extractToolResults(
  prompt: LanguageModelV2CallOptions['prompt']
): Array<{ toolCallId: string; toolName: string; output: unknown }> {
  const lastMsg = prompt.at(-1)
  if (!lastMsg || lastMsg.role !== 'tool') return []

  return lastMsg.content
    .filter(
      (
        part
      ): part is Extract<
        (typeof lastMsg.content)[number],
        { type: 'tool-result' }
      > => part.type === 'tool-result'
    )
    .map((part) => ({
      toolCallId: part.toolCallId,
      toolName: part.toolName,
      output: 'output' in part ? resolveToolOutput(part.output) : part,
    }))
}

function resolveToolOutput(
  output:
    | { type: string; value: unknown }
    | Array<{ type: string; value: unknown }>
): unknown {
  if (Array.isArray(output)) {
    return output.map((o) => o.value)
  }
  return output.value
}

export function buildA2ARequest(
  userText: string,
  contextId?: string,
  tools?: RemoteToolDefinition[]
): Record<string, unknown> {
  return {
    jsonrpc: '2.0',
    id: crypto.randomUUID(),
    method: 'message/stream',
    params: {
      message: {
        kind: 'message',
        role: 'user',
        messageId: crypto.randomUUID(),
        parts: [{ kind: 'text', text: userText }],
      },
      ...(contextId ? { contextId } : {}),
      ...(tools && tools.length > 0
        ? {
            metadata: {
              'https://grafana.com/extensions/client-provided-tools/v1': {
                tools,
              },
            },
          }
        : {}),
    },
  }
}
