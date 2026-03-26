import type { LanguageModelV2StreamPart } from '@ai-sdk/provider'
import log from 'electron-log/main'

import { processA2AEvent } from './eventMapper'
import { extractSSEEvents } from './sseParser'
import type { ActiveA2ASession } from './types'

const PREFIX = '[GrafanaAssistant]'

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

/**
 * Creates a ReadableStream that reads SSE data from the A2A session and
 * emits LanguageModelV2StreamPart values for the Vercel AI SDK.
 *
 * @param cleanupSession - Called when the session is done (completed/error/abort).
 *   Must NOT be called when finishing for tool-calls, because the session is
 *   needed for the continuation doStream() call.
 */
export function createA2AStream(
  session: ActiveA2ASession,
  cleanupSession: () => void
): ReadableStream<LanguageModelV2StreamPart> {
  const decoder = new TextDecoder()
  let emittedToolCalls = false
  let finished = false

  return new ReadableStream<LanguageModelV2StreamPart>({
    async pull(controller) {
      if (finished) {
        controller.close()
        return
      }

      // Emit finish(tool-calls) on a SEPARATE pull() cycle from the one
      // that enqueued the tool-call part. The AI SDK needs to process
      // the tool-call before seeing finish.
      if (session.readyToFinishForTools && emittedToolCalls) {
        finished = true
        controller.enqueue(FINISH_TOOL_CALLS)
        controller.close()
        return
      }

      try {
        let enqueuedSomething = false

        // eslint-disable-next-line no-constant-condition
        while (true) {
          // If tool calls are matched and the server is waiting for our
          // response, stop reading SSE. Defer or emit finish depending
          // on whether we enqueued parts this cycle.
          if (session.readyToFinishForTools && emittedToolCalls) {
            if (enqueuedSomething) {
              return // Defer finish to next pull()
            }

            finished = true
            controller.enqueue(FINISH_TOOL_CALLS)
            controller.close()
            return
          }

          const { done, value } = await session.reader.read()

          if (done) {
            if (!finished) {
              finished = true
              controller.enqueue(
                emittedToolCalls ? FINISH_TOOL_CALLS : FINISH_STOP
              )
            }
            controller.close()
            cleanupSession()
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

              if (part.type === 'error') {
                finished = true
                controller.close()
                cleanupSession()
                return
              }

              if (part.type === 'finish') {
                if (part.finishReason !== 'tool-calls') {
                  cleanupSession()
                }
                controller.close()
                return
              }
            }
          }
        }
      } catch (error) {
        if (isAbortError(error)) {
          finished = true
          controller.close()
          cleanupSession()
          return
        }

        log.error(PREFIX, `Stream error:`, error)
        finished = true
        controller.enqueue({ type: 'error', error })
        controller.close()
        cleanupSession()
      }
    },

    cancel() {
      session.sessionAbortController.abort()
      cleanupSession()
    },
  })
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  )
}
