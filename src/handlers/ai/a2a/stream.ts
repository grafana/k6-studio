import type { LanguageModelV2StreamPart } from '@ai-sdk/provider'
import log from 'electron-log/main'

import { isAbortError } from '@/utils/errors'

import { LOG_PREFIX, NO_USAGE } from './constants'
import { processA2AEvent } from './eventMapper'
import type { ActiveA2ASession } from './session'

const FINISH_TOOL_CALLS: LanguageModelV2StreamPart = {
  type: 'finish',
  finishReason: 'tool-calls',
  usage: NO_USAGE,
}

const FINISH_STOP: LanguageModelV2StreamPart = {
  type: 'finish',
  finishReason: 'stop',
  usage: NO_USAGE,
}

/**
 * Creates a ReadableStream that reads SSE data from the A2A session and
 * emits LanguageModelV2StreamPart values for the Vercel AI SDK.
 *
 * Uses a push-based approach (start + async loop) instead of pull-based
 * to avoid ReadableStream backpressure blocking text-delta delivery.
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

  return new ReadableStream<LanguageModelV2StreamPart>(
    {
      start(controller) {
        void readLoop(controller)
      },
      cancel() {
        session.sessionAbortController.abort()
        cleanupSession()
      },
    },
    new CountQueuingStrategy({ highWaterMark: 256 })
  )

  async function readLoop(
    controller: ReadableStreamDefaultController<LanguageModelV2StreamPart>
  ): Promise<void> {
    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await session.reader.read()

        if (done) {
          if (emittedToolCalls) {
            controller.enqueue(FINISH_TOOL_CALLS)
          } else {
            controller.enqueue(FINISH_STOP)
            cleanupSession()
          }
          controller.close()
          return
        }

        session.sseBuffer += decoder.decode(value, { stream: true })
        const events = session.extractSSEEvents()

        for (const event of events) {
          const parts = processA2AEvent(event, session)

          for (const part of parts) {
            if (part.type === 'tool-call') {
              emittedToolCalls = true
            }

            controller.enqueue(part)

            if (part.type === 'error') {
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

        // Check after processing events, not just at loop top,
        // because the reader may block waiting for server data.
        if (session.readyToFinishForTools && emittedToolCalls) {
          controller.enqueue(FINISH_TOOL_CALLS)
          controller.close()
          return
        }
      }
    } catch (error) {
      if (isAbortError(error)) {
        controller.close()
        cleanupSession()
        return
      }

      log.error(LOG_PREFIX, `Stream error:`, error)
      controller.enqueue({
        type: 'error',
        error: error instanceof Error ? error : new Error(String(error)),
      })
      controller.close()
      cleanupSession()
    }
  }
}
