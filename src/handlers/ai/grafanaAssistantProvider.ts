import type {
  LanguageModelV2,
  LanguageModelV2CallOptions,
} from '@ai-sdk/provider'
import log from 'electron-log/main'

import { sendTaskCancel } from './a2a/cancelTask'
import { AssistantError, classifyError } from './a2a/classifyError'
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

/**
 * Aborts all in-flight A2A SSE sessions (e.g. on assistant sign-out or Grafana sign-out).
 * Must run before clearing assistant tokens so cleanup can still cancel tasks with the
 * session's in-memory config.
 */
export function abortAllActiveAssistantSessions(): void {
  const entries = [...activeSessions.entries()]
  for (const [chatId, session] of entries) {
    session.sessionAbortController.abort()
    cleanupSession(chatId, session)
  }
}

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

    let config: A2AConfig
    try {
      config = await getA2AConfig()
    } catch (error) {
      throw toAssistantError(error)
    }

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

    // Do NOT reset `allToolCallsReceived` here: when the server emits parallel
    // tool_calls fragmented across streams (step.complete arrives after the
    // first tool_call, with more tool_calls + requests arriving after), the
    // continuation stream never sees another step.complete. Keeping the flag
    // true lets the continuation stream finish as soon as the new tool_call
    // is matched with its REMOTE_TOOL_REQUEST.

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
  let response: Response
  try {
    response = await fetch(`${config.baseUrl}/agents/${config.agentId}`, {
      method: 'POST',
      headers: {
        ...buildA2AHeaders(config),
        Accept: 'text/event-stream',
        'X-A2A-Extensions': config.extensions,
      },
      body: JSON.stringify(body),
      signal,
    })
  } catch (error) {
    throw toAssistantError(error)
  }

  if (!response.ok) {
    const text = await safeResponseText(response)
    const message = `A2A request failed (${response.status}): ${text}`
    const errorInfo = classifyError(message, {
      httpStatus: response.status,
    })
    throw new AssistantError(message, errorInfo)
  }

  if (!response.body) {
    const message = 'A2A response has no body'
    throw new AssistantError(message, { category: 'unknown', message })
  }

  return response.body.getReader()
}

function toAssistantError(error: unknown): AssistantError {
  if (error instanceof AssistantError) {
    return error
  }
  const message = error instanceof Error ? error.message : 'Unknown error'
  const errorInfo = classifyError(message, {
    isTypeError: error instanceof TypeError,
  })
  return new AssistantError(message, errorInfo)
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
