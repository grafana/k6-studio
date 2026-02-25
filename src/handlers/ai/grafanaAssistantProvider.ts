import type {
  LanguageModelV2,
  LanguageModelV2CallOptions,
} from '@ai-sdk/provider'
import log from 'electron-log/main'

import { a2aConfig } from './a2a/config'
import {
  buildA2ARequest,
  extractChatId,
  extractLatestUserText,
  extractToolResults,
} from './a2a/helpers'
import { sendRemoteToolResponse } from './a2a/remoteToolResponse'
import { createA2AStream } from './a2a/stream'
import type { ActiveA2ASession } from './a2a/types'
import { getToolDefinitionsForA2A } from './tools'

const PREFIX = '[GrafanaAssistant]'

/** Active SSE sessions keyed by chatId */
const activeSessions = new Map<string, ActiveA2ASession>()

export class GrafanaAssistantLanguageModel implements LanguageModelV2 {
  readonly specificationVersion = 'v2' as const
  readonly provider = 'grafana-assistant'
  readonly modelId = 'grafana_assistant_k6_studio'
  readonly supportedUrls = {}

  doGenerate(
    _options: LanguageModelV2CallOptions
  ): ReturnType<LanguageModelV2['doGenerate']> {
    throw new Error(
      'GrafanaAssistantLanguageModel does not support non-streaming generation. Use doStream instead.'
    )
  }

  async doStream(
    options: LanguageModelV2CallOptions
  ): Promise<Awaited<ReturnType<LanguageModelV2['doStream']>>> {
    const chatId = extractChatId(options)
    const existingSession = activeSessions.get(chatId)
    const toolResults = extractToolResults(options.prompt)

    if (existingSession && toolResults.length > 0) {
      log.info(PREFIX, `doStream (continuation) chatId=${chatId}`)
      return this.handleToolResultContinuation(
        existingSession,
        toolResults,
        options.abortSignal
      )
    }

    log.info(PREFIX, `doStream (new message) chatId=${chatId}`)
    return this.handleNewMessage(chatId, options)
  }

  private async handleNewMessage(
    chatId: string,
    options: LanguageModelV2CallOptions
  ): Promise<Awaited<ReturnType<LanguageModelV2['doStream']>>> {
    cleanupSession(chatId)

    const sessionAbortController = new AbortController()
    if (options.abortSignal) {
      options.abortSignal.addEventListener(
        'abort',
        () => sessionAbortController.abort(),
        { once: true }
      )
    }

    const existingSession = activeSessions.get(chatId)
    const contextId = existingSession?.contextId
    const userText = extractLatestUserText(options.prompt)
    const body = buildA2ARequest(
      userText,
      contextId,
      getToolDefinitionsForA2A()
    )
    log.info('Request body', JSON.stringify(body, null, 2))

    const response = await fetch(
      `${a2aConfig.baseUrl}/agents/${a2aConfig.agentId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          'X-A2A-Extensions': a2aConfig.remoteToolExtension,
          'X-Scope-OrgID': a2aConfig.scopeOrgId,
          'X-Grafana-URL': a2aConfig.grafanaUrl,
          'X-Grafana-API-Key': a2aConfig.grafanaApiKey,
        },
        body: JSON.stringify(body),
        signal: sessionAbortController.signal,
      }
    )

    if (!response.ok) {
      const text = await response.text().catch(() => 'Unknown error')
      throw new Error(`A2A request failed (${response.status}): ${text}`)
    }

    if (!response.body) {
      throw new Error('A2A response has no body')
    }

    const session: ActiveA2ASession = {
      reader: response.body.getReader(),
      contextId,
      taskId: undefined,
      sessionAbortController,
      pendingToolRequests: new Map(),
      unmatchedToolCalls: [],
      unmatchedRemoteRequests: [],
      sseBuffer: '',
      readyToFinishForTools: false,
    }
    activeSessions.set(chatId, session)

    const stream = createA2AStream(session, () => cleanupSession(chatId))
    return { stream }
  }

  private async handleToolResultContinuation(
    session: ActiveA2ASession,
    toolResults: Array<{
      toolCallId: string
      toolName: string
      output: unknown
    }>,
    abortSignal?: AbortSignal
  ): Promise<Awaited<ReturnType<LanguageModelV2['doStream']>>> {
    if (abortSignal) {
      abortSignal.addEventListener(
        'abort',
        () => session.sessionAbortController.abort(),
        { once: true }
      )
    }

    session.readyToFinishForTools = false

    for (const result of toolResults) {
      const pending = session.pendingToolRequests.get(result.toolCallId)
      if (!pending) {
        log.warn(
          PREFIX,
          `No pending request for toolCallId=${result.toolCallId}. Skipping.`
        )
        continue
      }

      await sendRemoteToolResponse({
        requestId: pending.requestId,
        chatId: pending.chatId,
        success: true,
        result: result.output,
      })

      session.pendingToolRequests.delete(result.toolCallId)
    }

    const chatId = findChatIdForSession(session)
    const stream = createA2AStream(session, () => cleanupSession(chatId))
    return { stream }
  }
}

function findChatIdForSession(session: ActiveA2ASession): string {
  for (const [chatId, s] of activeSessions.entries()) {
    if (s === session) {
      return chatId
    }
  }
  return 'unknown'
}

function cleanupSession(chatId: string): void {
  const session = activeSessions.get(chatId)
  if (!session) {
    return
  }

  try {
    session.reader.cancel().catch(() => {})
  } catch {
    // Ignore
  }

  activeSessions.delete(chatId)
}
