import type { LanguageModelV2CallOptions } from '@ai-sdk/provider'

import { getToolDefinitionsForA2A } from '../tools'

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
  for (let i = prompt.length - 1; i >= 0; i--) {
    const msg = prompt[i]
    if (msg?.role === 'user') {
      const textParts: string[] = []
      for (const part of msg.content) {
        if (part.type === 'text') {
          textParts.push(part.text)
        }
      }
      return textParts.join('\n')
    }
  }

  return ''
}

export function extractToolResults(
  prompt: LanguageModelV2CallOptions['prompt']
): Array<{ toolCallId: string; toolName: string; output: unknown }> {
  const results: Array<{
    toolCallId: string
    toolName: string
    output: unknown
  }> = []

  const lastMsg = prompt[prompt.length - 1]
  if (!lastMsg || lastMsg.role !== 'tool') {
    return results
  }

  for (const part of lastMsg.content) {
    if (part.type === 'tool-result') {
      const output = 'output' in part ? resolveToolOutput(part.output) : part

      results.push({
        toolCallId: part.toolCallId,
        toolName: part.toolName,
        output,
      })
    }
  }

  return results
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
  contextId?: string
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
      metadata: {
        'https://grafana.com/extensions/client-provided-tools/v1': {
          tools: getToolDefinitionsForA2A(),
        },
      },
    },
  }
}
