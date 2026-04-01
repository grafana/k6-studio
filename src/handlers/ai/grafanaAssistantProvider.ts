import type {
  LanguageModelV2,
  LanguageModelV2CallOptions,
} from '@ai-sdk/provider'
import log from 'electron-log/main'

import { sendTaskCancel } from './a2a/cancelTask'
import { type A2AConfig, getA2AConfig } from './a2a/config'
import { LOG_PREFIX } from './a2a/constants'
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
      log.info(LOG_PREFIX, `doStream (continuation) chatId=${chatId}`)
      return this.handleToolResultContinuation(
        chatId,
        existingSession,
        toolResults,
        options.abortSignal
      )
    }

    log.info(LOG_PREFIX, `doStream (new message) chatId=${chatId}`)
    return this.handleNewMessage(chatId, options)
  }

  private async handleNewMessage(
    chatId: string,
    options: LanguageModelV2CallOptions
  ): Promise<Awaited<ReturnType<LanguageModelV2['doStream']>>> {
    const existingSession = activeSessions.get(chatId)
    const contextId = existingSession?.contextId

    if (existingSession) {
      existingSession.sessionAbortController.abort()
    }
    cleanupSession(chatId)

    const sessionAbortController = new AbortController()
    if (options.abortSignal) {
      options.abortSignal.addEventListener(
        'abort',
        () => sessionAbortController.abort(),
        { once: true }
      )
    }
    const config = await getA2AConfig()
    const userText = extractLatestUserText(options.prompt)
    const body = buildA2ARequest(
      userText,
      contextId,
      getToolDefinitionsForA2A()
    )
    log.info(
      LOG_PREFIX,
      `Sending A2A request for chatId=${chatId}, contextId=${contextId}`
    )

    const reader = await fetchA2AReader(
      config,
      body,
      sessionAbortController.signal
    )

    const session: ActiveA2ASession = {
      reader,
      contextId,
      taskId: undefined,
      sessionAbortController,
      config: {
        baseUrl: config.baseUrl,
        agentId: config.agentId,
        bearerToken: config.bearerToken,
      },
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
    chatId: string,
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
          LOG_PREFIX,
          `No pending request for toolCallId=${result.toolCallId}. Skipping.`
        )
        continue
      }

      await sendRemoteToolResponse(session.config, {
        requestId: pending.requestId,
        chatId: pending.chatId,
        success: true,
        result: result.output,
      })

      session.pendingToolRequests.delete(result.toolCallId)
    }

    const stream = createA2AStream(session, () => cleanupSession(chatId))
    return { stream }
  }
}

async function fetchA2AReader(
  config: A2AConfig,
  body: Record<string, unknown>,
  signal: AbortSignal
): Promise<ReadableStreamDefaultReader<Uint8Array>> {
  const response = await fetch(`${config.baseUrl}/agents/${config.agentId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      Authorization: `Bearer ${config.bearerToken}`,
      'X-A2A-Extensions': config.remoteToolExtension,
      'X-App-Source': 'k6-studio',
    },
    body: JSON.stringify(body),
    signal,
  })

  if (!response.ok) {
    const text = await response.text().catch(() => 'Unknown error')
    throw new Error(`A2A request failed (${response.status}): ${text}`)
  }

  if (!response.body) {
    throw new Error('A2A response has no body')
  }

  return response.body.getReader()
}

function cleanupSession(chatId: string): void {
  const session = activeSessions.get(chatId)
  if (!session) {
    return
  }

  if (session.taskId && session.sessionAbortController.signal.aborted) {
    sendTaskCancel(session.config, session.taskId).catch((error) => {
      log.error(LOG_PREFIX, 'Failed to cancel A2A task:', error)
    })
  }

  try {
    session.reader.cancel().catch(() => {})
  } catch {
    // Ignore
  }

  activeSessions.delete(chatId)
}
