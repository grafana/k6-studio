import type { LanguageModelV2CallOptions } from '@ai-sdk/provider'

import type { RemoteToolDefinition } from '../tools'

import type { A2ASessionConfig } from './types'

export function safeResponseText(response: Response): Promise<string> {
  return response.text().catch(() => 'Unknown error')
}

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
  const chatId = options.providerOptions?.grafanaAssistant?.chatId

  if (typeof chatId !== 'string') {
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
      output: part.output.value,
    }))
}

export interface A2AJsonRpcRequest {
  jsonrpc: '2.0'
  id: string
  method: 'message/stream'
  params: {
    message: {
      kind: 'message'
      role: 'user'
      messageId: string
      parts: Array<{ kind: 'text'; text: string }>
    }
    contextId?: string
    metadata?: Record<string, unknown>
  }
}

export function buildA2ARequest(
  userText: string,
  contextId?: string,
  tools?: RemoteToolDefinition[]
): A2AJsonRpcRequest {
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
