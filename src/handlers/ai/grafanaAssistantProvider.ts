import type {
  LanguageModelV2,
  LanguageModelV2CallOptions,
} from '@ai-sdk/provider'
import log from 'electron-log/main'

import { sendTaskCancel } from './a2a/cancelTask'
import { AssistantError, classifyError } from './a2a/classifyError'
import { getA2AConfig } from './a2a/config'
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

    let config: Awaited<ReturnType<typeof getA2AConfig>>
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
      PREFIX,
      `Sending A2A request for chatId=${chatId}, contextId=${contextId}`
    )

    let response: Response
    try {
      response = await fetch(`${config.baseUrl}/agents/${config.agentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          Authorization: `Bearer ${config.bearerToken}`,
          'X-A2A-Extensions': config.remoteToolExtension,
          'X-App-Source': 'k6-studio',
        },
        body: JSON.stringify(body),
        signal: sessionAbortController.signal,
      })
    } catch (error) {
      throw toAssistantError(error)
    }

    if (!response.ok) {
      const text = await response.text().catch(() => 'Unknown error')
      const message = `A2A request failed (${response.status}): ${text}`
      const errorInfo = classifyError(message, {
        httpStatus: response.status,
        apiEndpoint: config.baseUrl.replace('/api/cli/v1/a2a', ''),
      })
      throw new AssistantError(message, errorInfo)
    }

    if (!response.body) {
      throw new AssistantError(
        'A2A response has no body',
        classifyError('A2A response has no body')
      )
    }

    const session: ActiveA2ASession = {
      reader: response.body.getReader(),
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

      await sendRemoteToolResponse(session.config, {
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

function cleanupSession(chatId: string): void {
  const session = activeSessions.get(chatId)
  if (!session) {
    return
  }

  if (session.taskId && session.sessionAbortController.signal.aborted) {
    sendTaskCancel(session.config, session.taskId).catch((error) => {
      log.error(PREFIX, 'Failed to cancel A2A task:', error)
    })
  }

  try {
    session.reader.cancel().catch(() => {})
  } catch {
    // Ignore
  }

  activeSessions.delete(chatId)
}
