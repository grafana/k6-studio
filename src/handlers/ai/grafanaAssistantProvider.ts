import type {
  LanguageModelV2,
  LanguageModelV2CallOptions,
} from '@ai-sdk/provider'
import log from 'electron-log/main'

import { sendTaskCancel } from './a2a/cancelTask'
import { type A2AConfig, getA2AConfig } from './a2a/config'
import { LOG_PREFIX } from './a2a/constants'
import {
  type A2AJsonRpcRequest,
  buildA2AHeaders,
  buildA2ARequest,
  extractChatId,
  extractLatestUserText,
  extractToolResults,
  safeResponseText,
} from './a2a/helpers'
import { sendRemoteToolResponse } from './a2a/remoteToolResponse'
import { ActiveA2ASession } from './a2a/session'
import { createA2AStream } from './a2a/stream'
import { getToolDefinitionsForA2A } from './tools'

function forwardAbortSignal(
  source: AbortSignal | undefined,
  target: AbortController
): void {
  if (!source) return
  if (source.aborted) {
    target.abort()
    return
  }
  source.addEventListener('abort', () => target.abort(), { once: true })
}

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
      cleanupSession(chatId, existingSession)
    }

    const sessionAbortController = new AbortController()
    forwardAbortSignal(options.abortSignal, sessionAbortController)

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

    const { extensions: _, ...sessionConfig } = config
    const session = new ActiveA2ASession(
      reader,
      contextId,
      sessionAbortController,
      sessionConfig
    )
    activeSessions.set(chatId, session)

    const stream = createA2AStream(session, () =>
      cleanupSession(chatId, session)
    )
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
    forwardAbortSignal(abortSignal, session.sessionAbortController)

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

    const stream = createA2AStream(session, () =>
      cleanupSession(chatId, session)
    )
    return { stream }
  }
}

async function fetchA2AReader(
  config: A2AConfig,
  body: A2AJsonRpcRequest,
  signal: AbortSignal
): Promise<ReadableStreamDefaultReader<Uint8Array>> {
  const response = await fetch(`${config.baseUrl}/agents/${config.agentId}`, {
    method: 'POST',
    headers: {
      ...buildA2AHeaders(config),
      Accept: 'text/event-stream',
      'X-A2A-Extensions': config.extensions,
    },
    body: JSON.stringify(body),
    signal,
  })

  if (!response.ok) {
    const text = await safeResponseText(response)
    throw new Error(`A2A request failed (${response.status}): ${text}`)
  }

  if (!response.body) {
    throw new Error('A2A response has no body')
  }

  return response.body.getReader()
}

function cleanupSession(
  chatId: string,
  specificSession: ActiveA2ASession
): void {
  const session = activeSessions.get(chatId)
  if (!session) {
    return
  }

  // Only clean up if the given session matches the current one
  if (session !== specificSession) {
    return
  }

  if (session.taskId && session.sessionAbortController.signal.aborted) {
    sendTaskCancel(session.config, session.taskId).catch((error) => {
      log.error(LOG_PREFIX, 'Failed to cancel A2A task:', error)
    })
  }

  session.reader.cancel().catch(() => {
    // AbortError is expected when cancelling an active reader
  })

  activeSessions.delete(chatId)
}
