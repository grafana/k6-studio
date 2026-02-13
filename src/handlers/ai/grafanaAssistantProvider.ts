import type {
  LanguageModelV2,
  LanguageModelV2CallOptions,
  LanguageModelV2StreamPart,
} from '@ai-sdk/provider'
import log from 'electron-log/main'

const A2A_BASE_URL = 'http://localhost:9091/api/v1/a2a'
const A2A_AGENT_ID = 'grafana_assistant_k6_studio'
const REMOTE_TOOL_EXTENSION =
  'https://grafana.com/extensions/remote-tool-execution/v1'

const PREFIX = '[GrafanaAssistant]'

// ── A2A Types ────────────────────────────────────────────────────────────────

interface A2AStatusUpdateEvent {
  kind: 'status-update'
  taskId: string
  contextId: string
  status: { state: string; message?: { parts?: Array<{ text?: string }> } }
  final?: boolean
}

interface A2AArtifactPart {
  kind: string
  text?: string
  data?: Record<string, unknown>
}

interface A2AArtifact {
  name: string
  artifactId: string
  parts: A2AArtifactPart[]
}

interface A2AArtifactUpdateEvent {
  kind: 'artifact-update'
  taskId: string
  contextId: string
  artifact: A2AArtifact
}

interface A2ARemoteToolRequestEvent {
  type: 'REMOTE_TOOL_REQUEST'
  data: {
    requestId: string
    chatId: string
    toolName: string
    toolInput: Record<string, unknown>
    timeoutMs?: number
  }
}

interface A2AToolCallData {
  toolId: string
  toolName: string
  inputs?: Record<string, unknown> | string
}

interface A2AStepCompleteData {
  stepId?: string
  stopReason?: string
  usage?: { inputTokens?: number; outputTokens?: number }
}

type A2ASSEResult =
  | A2AStatusUpdateEvent
  | A2AArtifactUpdateEvent
  | A2ARemoteToolRequestEvent

interface A2ASSEEvent {
  jsonrpc: string
  id: string | number
  result?: A2ASSEResult
  error?: { code: number; message: string; data?: string }
}

// ── Session State ────────────────────────────────────────────────────────────

interface PendingToolRequest {
  requestId: string
  chatId: string
}

interface ActiveA2ASession {
  reader: ReadableStreamDefaultReader<Uint8Array>
  contextId: string | undefined
  taskId: string | undefined
  sessionAbortController: AbortController
  /** Maps toolId (from step.toolCall) → remote tool request info */
  pendingToolRequests: Map<string, PendingToolRequest>
  /** Queue of tool calls that haven't been matched to a REMOTE_TOOL_REQUEST yet */
  unmatchedToolCalls: Array<{ toolId: string; toolName: string }>
  /** Queue of remote requests that haven't been matched to a step.toolCall yet */
  unmatchedRemoteRequests: Array<{
    requestId: string
    chatId: string
    toolName: string
  }>
  /** Leftover bytes from SSE parsing between reads */
  sseBuffer: string
  /** Set to true when all emitted tool calls have been matched with REMOTE_TOOL_REQUESTs */
  readyToFinishForTools: boolean
}

// ── Provider ─────────────────────────────────────────────────────────────────

/** Active SSE sessions keyed by chatId */
const activeSessions = new Map<string, ActiveA2ASession>()

export class GrafanaAssistantLanguageModel implements LanguageModelV2 {
  readonly specificationVersion = 'v2' as const
  readonly provider = 'grafana-assistant'
  readonly modelId = 'grafana_assistant_k6_studio'
  readonly supportedUrls = {}

  // ── doGenerate ───────────────────────────────────────────────────────────

  doGenerate(
    _options: LanguageModelV2CallOptions
  ): ReturnType<LanguageModelV2['doGenerate']> {
    throw new Error(
      'GrafanaAssistantLanguageModel does not support non-streaming generation. Use doStream instead.'
    )
  }

  // ── doStream ─────────────────────────────────────────────────────────────

  async doStream(
    options: LanguageModelV2CallOptions
  ): Promise<Awaited<ReturnType<LanguageModelV2['doStream']>>> {
    const chatId = extractChatId(options)
    const existingSession = activeSessions.get(chatId)

    // Check if the latest messages contain tool results — that means this is
    // a continuation call where we need to send results back to A2A.
    const toolResults = extractToolResults(options.prompt)

    if (existingSession && toolResults.length > 0) {
      log.info(
        PREFIX,
        `doStream (continuation) chatId=${chatId} toolResults=${toolResults.length}`
      )
      return this.handleToolResultContinuation(
        existingSession,
        toolResults,
        options.abortSignal
      )
    }

    // Otherwise this is a fresh message – open a new SSE stream to A2A.
    log.info(PREFIX, `doStream (new message) chatId=${chatId}`)
    return this.handleNewMessage(chatId, options)
  }

  // ── Fresh message → open SSE stream ──────────────────────────────────────

  private async handleNewMessage(
    chatId: string,
    options: LanguageModelV2CallOptions
  ): Promise<Awaited<ReturnType<LanguageModelV2['doStream']>>> {
    // Clean up any stale session for this chatId
    cleanupSession(chatId)

    const sessionAbortController = new AbortController()

    // Forward caller abort to the session
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
    const body = buildA2ARequest(userText, contextId)

    log.info(
      PREFIX,
      `Sending message/stream to A2A`,
      `contextId=${contextId ?? '(new)'}`,
      `textLength=${userText.length}`
    )

    const response = await fetch(`${A2A_BASE_URL}/agents/${A2A_AGENT_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        'X-A2A-Extensions': REMOTE_TOOL_EXTENSION,
        'X-Scope-OrgID': '123',
        'X-Grafana-URL': 'http://localhost:3000',
        'X-Grafana-API-Key': 'local-dev',
      },
      body: JSON.stringify(body),
      signal: sessionAbortController.signal,
    })

    if (!response.ok) {
      const text = await response.text().catch(() => 'Unknown error')
      log.error(PREFIX, `A2A request failed (${response.status}):`, text)
      throw new Error(`A2A request failed (${response.status}): ${text}`)
    }

    if (!response.body) {
      throw new Error('A2A response has no body')
    }

    log.info(PREFIX, `SSE connection opened`)

    const reader = response.body.getReader()

    const session: ActiveA2ASession = {
      reader,
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

    const stream = createA2AStream(session, chatId)
    return { stream }
  }

  // ── Tool result continuation → send results + resume SSE ─────────────────

  private async handleToolResultContinuation(
    session: ActiveA2ASession,
    toolResults: Array<{
      toolCallId: string
      toolName: string
      output: unknown
    }>,
    abortSignal?: AbortSignal
  ): Promise<Awaited<ReturnType<LanguageModelV2['doStream']>>> {
    // Forward caller abort to the session
    if (abortSignal) {
      abortSignal.addEventListener(
        'abort',
        () => session.sessionAbortController.abort(),
        { once: true }
      )
    }

    // Reset the tool-finish flag for the next round
    session.readyToFinishForTools = false

    // Send each tool result to the remote-tool-response endpoint
    for (const result of toolResults) {
      const pending = session.pendingToolRequests.get(result.toolCallId)
      if (!pending) {
        log.warn(
          PREFIX,
          `No pending remote tool request for toolCallId=${result.toolCallId} (tool=${result.toolName}). Skipping.`
        )
        continue
      }

      log.info(
        PREFIX,
        `Sending remote tool response: tool=${result.toolName} requestId=${pending.requestId}`
      )

      await sendRemoteToolResponse({
        requestId: pending.requestId,
        chatId: pending.chatId,
        success: true,
        result: result.output,
      })

      session.pendingToolRequests.delete(result.toolCallId)
    }

    // Resume reading from the existing SSE stream — the A2A server continues
    // processing after receiving the tool response.
    log.info(PREFIX, `Resuming SSE stream after tool result submission`)
    const chatId = findChatIdForSession(session)
    const stream = createA2AStream(session, chatId)
    return { stream }
  }
}

// ── SSE Stream → LanguageModelV2StreamPart ────────────────────────────────────

function createA2AStream(
  session: ActiveA2ASession,
  chatId: string
): ReadableStream<LanguageModelV2StreamPart> {
  const decoder = new TextDecoder()
  let emittedToolCalls = false
  let finished = false

  const FINISH_TOOL_CALLS: LanguageModelV2StreamPart = {
    type: 'finish',
    finishReason: 'tool-calls',
    usage: {
      inputTokens: undefined,
      outputTokens: undefined,
      totalTokens: undefined,
    },
  }

  const FINISH_STOP: LanguageModelV2StreamPart = {
    type: 'finish',
    finishReason: 'stop',
    usage: {
      inputTokens: undefined,
      outputTokens: undefined,
      totalTokens: undefined,
    },
  }

  return new ReadableStream<LanguageModelV2StreamPart>({
    async pull(controller) {
      if (finished) {
        controller.close()
        return
      }

      // If tool calls are ready to finish, emit finish on a SEPARATE pull()
      // cycle from the one that enqueued the tool-input parts. This is
      // critical: the AI SDK needs to process tool-input-start/delta/end
      // before it sees finish. Emitting both in the same pull() causes
      // the SDK to close the stream before flushing tool-input-end, so
      // onToolCall never fires in the renderer.
      if (session.readyToFinishForTools && emittedToolCalls) {
        log.info(
          PREFIX,
          `Emitting finish(tool-calls) — deferred to separate pull() cycle`
        )
        finished = true
        controller.enqueue(FINISH_TOOL_CALLS)
        controller.close()
        return
      }

      try {
        // Read SSE chunks in a loop. We must keep reading until we either:
        // (a) enqueue at least one part — so the consumer has data and will
        //     call pull() again, or
        // (b) readyToFinishForTools becomes true with emittedToolCalls — so
        //     we can emit finish (either now or on the next pull() cycle).
        //
        // Events like REMOTE_TOOL_REQUEST produce zero parts, so we must
        // continue reading past them. But once they set the finish flag we
        // must stop reading because the A2A server is now blocking, waiting
        // for our remote tool response.
        let enqueuedSomething = false

        // eslint-disable-next-line no-constant-condition
        while (true) {
          // If tool calls are matched and the server is waiting for our
          // response, stop reading SSE. If we enqueued something this
          // cycle (e.g. the tool-call part), defer finish to the next
          // pull(). If we didn't (e.g. only REMOTE_TOOL_REQUEST arrived),
          // emit finish immediately since there's nothing to flush.
          if (session.readyToFinishForTools && emittedToolCalls) {
            if (enqueuedSomething) {
              log.info(
                PREFIX,
                `Tool calls matched — deferring finish to next pull() cycle`
              )
              return
            }

            log.info(
              PREFIX,
              `Tool calls matched (no new parts) — emitting finish immediately`
            )
            finished = true
            controller.enqueue(FINISH_TOOL_CALLS)
            controller.close()
            return
          }

          const { done, value } = await session.reader.read()

          if (done) {
            log.info(PREFIX, `SSE stream ended (reader done)`)
            if (!finished) {
              finished = true
              controller.enqueue(
                emittedToolCalls ? FINISH_TOOL_CALLS : FINISH_STOP
              )
            }
            controller.close()
            cleanupSession(chatId)
            return
          }

          session.sseBuffer += decoder.decode(value, { stream: true })
          const events = extractSSEEvents(session)

          for (const event of events) {
            const parts = processA2AEvent(event, session)

            for (const part of parts) {
              if (part.type === 'tool-call') {
                emittedToolCalls = true
              }

              if (part.type === 'finish') {
                finished = true
              }

              controller.enqueue(part)
              enqueuedSomething = true

              // On error, close and clean up immediately
              if (part.type === 'error') {
                finished = true
                controller.close()
                cleanupSession(chatId)
                return
              }

              if (part.type === 'finish') {
                if (part.finishReason !== 'tool-calls') {
                  cleanupSession(chatId)
                }
                controller.close()
                return
              }
            }
          }
        }
      } catch (error) {
        if (isAbortError(error)) {
          log.info(PREFIX, `SSE stream aborted`)
          finished = true
          controller.close()
          cleanupSession(chatId)
          return
        }

        log.error(PREFIX, `SSE stream error:`, error)
        finished = true
        controller.enqueue({ type: 'error', error })
        controller.close()
        cleanupSession(chatId)
      }
    },

    cancel() {
      log.info(PREFIX, `Stream cancelled`)
      session.sessionAbortController.abort()
      cleanupSession(chatId)
    },
  })
}

// ── SSE Parsing ──────────────────────────────────────────────────────────────

function extractSSEEvents(session: ActiveA2ASession): A2ASSEEvent[] {
  const events: A2ASSEEvent[] = []
  const lines = session.sseBuffer.split('\n')
  let dataLines: string[] = []
  let lastCompleteIndex = -1

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''

    if (line.trim() === '') {
      // Blank line = end of an SSE event
      if (dataLines.length > 0) {
        try {
          const parsed = JSON.parse(dataLines.join('\n')) as A2ASSEEvent
          events.push(parsed)
        } catch {
          // Skip malformed events
          log.warn(PREFIX, `Failed to parse SSE event:`, dataLines.join('\n'))
        }
      }
      dataLines = []
      lastCompleteIndex = i
      continue
    }

    if (line.startsWith('data: ')) {
      dataLines.push(line.slice(6))
    }
  }

  // Keep only the unparsed remainder in the buffer
  session.sseBuffer =
    lastCompleteIndex >= 0
      ? lines.slice(lastCompleteIndex + 1).join('\n')
      : session.sseBuffer

  return events
}

// ── A2A Event → Stream Parts ─────────────────────────────────────────────────

function processA2AEvent(
  event: A2ASSEEvent,
  session: ActiveA2ASession
): LanguageModelV2StreamPart[] {
  if (event.error) {
    log.error(
      PREFIX,
      `A2A error (${event.error.code}):`,
      event.error.message,
      event.error.data
    )
    return [
      {
        type: 'error',
        error: new Error(
          `A2A error (${event.error.code}): ${event.error.message}`
        ),
      },
    ]
  }

  const result = event.result
  if (!result) {
    log.warn(PREFIX, `SSE event with no result and no error`)
    return []
  }

  // REMOTE_TOOL_REQUEST — custom event type
  if ('type' in result && result.type === 'REMOTE_TOOL_REQUEST') {
    const req = result
    log.info(
      PREFIX,
      `← REMOTE_TOOL_REQUEST: tool=${req.data.toolName} requestId=${req.data.requestId}`
    )
    handleRemoteToolRequest(session, req)
    return []
  }

  // Status update
  if ('kind' in result && result.kind === 'status-update') {
    const statusEvent = result
    log.info(
      PREFIX,
      `← status-update: state=${statusEvent.status.state} taskId=${statusEvent.taskId}`
    )
    return handleStatusUpdate(session, statusEvent)
  }

  // Artifact update
  if ('kind' in result && result.kind === 'artifact-update') {
    const artifactEvent = result
    log.info(
      PREFIX,
      `← artifact-update: name=${artifactEvent.artifact.name} id=${artifactEvent.artifact.artifactId}`
    )
    return handleArtifactUpdate(session, artifactEvent)
  }

  log.warn(PREFIX, `Unknown SSE event result type:`, JSON.stringify(result))
  return []
}

function handleStatusUpdate(
  session: ActiveA2ASession,
  event: A2AStatusUpdateEvent
): LanguageModelV2StreamPart[] {
  session.taskId = event.taskId
  session.contextId = event.contextId

  const state = event.status.state

  if (state === 'completed') {
    log.info(PREFIX, `Task completed`)
    return [
      {
        type: 'finish',
        finishReason: 'stop',
        usage: {
          inputTokens: undefined,
          outputTokens: undefined,
          totalTokens: undefined,
        },
      },
    ]
  }

  if (state === 'failed' || state === 'canceled') {
    // Extract error message from the status if available
    const statusMessage = event.status.message?.parts
      ?.map((p) => p.text)
      .filter(Boolean)
      .join(' ')

    const errorMessage =
      statusMessage || `A2A task ${state} (taskId=${event.taskId})`

    log.error(PREFIX, `Task ${state}:`, errorMessage)

    // Emit an error part so streamText throws and useChat's onError fires
    return [{ type: 'error', error: new Error(errorMessage) }]
  }

  return []
}

function handleArtifactUpdate(
  session: ActiveA2ASession,
  event: A2AArtifactUpdateEvent
): LanguageModelV2StreamPart[] {
  const { artifact } = event

  switch (artifact.name) {
    case 'step.toolCall':
      return handleToolCallArtifact(session, artifact)

    case 'step.complete':
      return handleStepComplete(session, artifact)

    case 'step.message':
      return handleMessageArtifact(artifact)

    case 'message.stream.start':
    case 'message.content.delta':
    case 'message.stream.complete':
      return handleTokenStreamArtifact(artifact)

    case 'step.toolResult':
      // Tool results from the server side — we don't need to emit these
      // as the AI SDK handles tool results separately.
      log.info(PREFIX, `← step.toolResult (server-side, ignoring)`)
      return []

    default:
      log.info(PREFIX, `← unhandled artifact: ${artifact.name}`)
      return []
  }
}

function handleToolCallArtifact(
  session: ActiveA2ASession,
  artifact: A2AArtifact
): LanguageModelV2StreamPart[] {
  const dataPart = artifact.parts.find((p) => p.kind === 'data' && p.data)
  if (!dataPart?.data) {
    log.warn(PREFIX, `step.toolCall artifact has no data part`)
    return []
  }

  const data = dataPart.data as unknown as A2AToolCallData
  const toolId = data.toolId
  const toolName = data.toolName
  const args =
    typeof data.inputs === 'string'
      ? data.inputs
      : JSON.stringify(data.inputs ?? {})

  log.info(PREFIX, `→ tool-call: tool=${toolName} id=${toolId} args=${args}`)

  // Queue for matching with REMOTE_TOOL_REQUEST
  session.unmatchedToolCalls.push({ toolId, toolName })
  tryMatchToolRequests(session)

  // Emit a complete tool-call part (not the streaming tool-input sequence).
  // We have all arguments at once from the A2A artifact, so streaming them
  // is unnecessary. Using tool-call ensures the AI SDK properly finalizes
  // the tool call and emits tool-input-end in the UI stream.
  return [
    {
      type: 'tool-call' as const,
      toolCallId: toolId,
      toolName,
      input: args,
    },
  ]
}

function handleStepComplete(
  _session: ActiveA2ASession,
  artifact: A2AArtifact
): LanguageModelV2StreamPart[] {
  const dataPart = artifact.parts.find((p) => p.kind === 'data' && p.data)
  const data = dataPart?.data as A2AStepCompleteData | undefined

  log.info(
    PREFIX,
    `← step.complete: stopReason=${data?.stopReason ?? '(none)'}`
  )

  // step.complete arrives AFTER tool execution finishes on the server side.
  // If this step had no tool calls (e.g. the final "finish" step), we emit
  // a finish. Otherwise, the finish was already emitted when we matched the
  // REMOTE_TOOL_REQUEST — so we skip here to avoid double-finishing.
  // We only emit finish here for non-tool-use steps.
  if (data?.stopReason !== 'tool_use') {
    return [
      {
        type: 'finish' as const,
        finishReason: 'stop' as const,
        usage: {
          inputTokens: undefined,
          outputTokens: undefined,
          totalTokens: undefined,
        },
      },
    ]
  }

  return []
}

function handleMessageArtifact(
  artifact: A2AArtifact
): LanguageModelV2StreamPart[] {
  const parts: LanguageModelV2StreamPart[] = []
  const id = artifact.artifactId

  for (const part of artifact.parts) {
    if (part.kind === 'text' && part.text) {
      parts.push({ type: 'text-start', id })
      parts.push({ type: 'text-delta', id, delta: part.text })
      parts.push({ type: 'text-end', id })
    }
  }

  return parts
}

function handleTokenStreamArtifact(
  artifact: A2AArtifact
): LanguageModelV2StreamPart[] {
  const parts: LanguageModelV2StreamPart[] = []
  const id = artifact.artifactId

  if (artifact.name === 'message.stream.start') {
    parts.push({ type: 'text-start', id })
  }

  if (artifact.name === 'message.content.delta') {
    for (const part of artifact.parts) {
      if (part.kind === 'text' && part.text) {
        parts.push({ type: 'text-delta', id, delta: part.text })
      }
    }
  }

  if (artifact.name === 'message.stream.complete') {
    parts.push({ type: 'text-end', id })
  }

  return parts
}

// ── Remote Tool Request Handling ──────────────────────────────────────────────

function handleRemoteToolRequest(
  session: ActiveA2ASession,
  event: A2ARemoteToolRequestEvent
): void {
  const { requestId, chatId, toolName } = event.data

  session.unmatchedRemoteRequests.push({ requestId, chatId, toolName })
  tryMatchToolRequests(session)
}

/**
 * Try to match unmatched tool calls with unmatched remote requests by toolName.
 * Since parallel tool calls are disabled, they arrive in order.
 *
 * When ALL unmatched tool calls have been matched, sets readyToFinishForTools
 * so the stream emits finish(tool-calls) — the A2A server is now blocking
 * and waiting for our remote tool response.
 */
function tryMatchToolRequests(session: ActiveA2ASession): void {
  const unmatchedCalls = session.unmatchedToolCalls
  const unmatchedRequests = session.unmatchedRemoteRequests

  let matchedAny = false
  let i = 0
  while (i < unmatchedCalls.length && unmatchedRequests.length > 0) {
    const call = unmatchedCalls[i]
    if (!call) break

    // Find a matching remote request (by toolName)
    const reqIndex = unmatchedRequests.findIndex(
      (r) => r.toolName === call.toolName
    )

    if (reqIndex !== -1) {
      const req = unmatchedRequests[reqIndex]
      if (req) {
        session.pendingToolRequests.set(call.toolId, {
          requestId: req.requestId,
          chatId: req.chatId,
        })
        log.info(
          PREFIX,
          `Matched tool call: toolId=${call.toolId} ↔ requestId=${req.requestId} (tool=${call.toolName})`
        )
      }
      unmatchedRequests.splice(reqIndex, 1)
      unmatchedCalls.splice(i, 1)
      matchedAny = true
      // Don't increment i — array shifted
    } else {
      i++
    }
  }

  // If we matched something and there are no more unmatched tool calls,
  // the server is now waiting for our tool response. Signal the stream to
  // emit finish(tool-calls) so the AI SDK can process them.
  if (
    matchedAny &&
    unmatchedCalls.length === 0 &&
    session.pendingToolRequests.size > 0
  ) {
    log.info(
      PREFIX,
      `All tool calls matched — setting readyToFinishForTools`,
      `pendingTools=${session.pendingToolRequests.size}`
    )
    session.readyToFinishForTools = true
  }
}

// ── Remote Tool Response ──────────────────────────────────────────────────────

async function sendRemoteToolResponse(payload: {
  requestId: string
  chatId: string
  success: boolean
  result?: unknown
  error?: string
}): Promise<void> {
  log.info(
    PREFIX,
    `POST /remote-tool-response requestId=${payload.requestId} success=${payload.success}`
  )

  const response = await fetch(`${A2A_BASE_URL}/remote-tool-response`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Scope-OrgID': '123',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => 'Unknown error')
    log.error(
      PREFIX,
      `Failed to send remote tool response (${response.status}):`,
      text
    )
  } else {
    log.info(PREFIX, `Remote tool response sent successfully`)
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function extractChatId(options: LanguageModelV2CallOptions): string {
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

function extractLatestUserText(
  prompt: LanguageModelV2CallOptions['prompt']
): string {
  // Walk backwards to find the last user message
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

function extractToolResults(
  prompt: LanguageModelV2CallOptions['prompt']
): Array<{ toolCallId: string; toolName: string; output: unknown }> {
  const results: Array<{
    toolCallId: string
    toolName: string
    output: unknown
  }> = []

  // Only look at the last message — if it's a tool message, this is a continuation
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

function buildA2ARequest(
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
    },
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

  log.info(PREFIX, `Cleaning up session chatId=${chatId}`)

  try {
    session.reader.cancel().catch(() => {})
  } catch {
    // Ignore
  }

  activeSessions.delete(chatId)
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  )
}
