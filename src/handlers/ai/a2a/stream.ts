import type { LanguageModelV2StreamPart } from '@ai-sdk/provider'
import log from 'electron-log/main'

import { isAbortError } from '@/utils/errors'

import { LOG_PREFIX } from './constants'
import { processA2AEvent } from './eventMapper'
import { extractSSEEvents } from './sseParser'
import type { ActiveA2ASession } from './types'

const NO_USAGE = {
  inputTokens: undefined,
  outputTokens: undefined,
  totalTokens: undefined,
}

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

type ReadLoopResult =
  | { outcome: 'yielded' }
  | { outcome: 'finish-tool-calls' }
  | { outcome: 'done'; emittedToolCalls: boolean }
  | { outcome: 'finish'; finishReason: string }
  | { outcome: 'error' }

/**
 * Reads SSE chunks from the session in a loop, enqueuing stream parts until
 * one of five termination conditions is reached.
 */
async function readAndProcessEvents(
  session: ActiveA2ASession,
  decoder: TextDecoder,
  controller: ReadableStreamDefaultController<LanguageModelV2StreamPart>,
  state: { emittedToolCalls: boolean }
): Promise<ReadLoopResult> {
  let enqueuedSomething = false

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // If tool calls are matched and the server is waiting for our
    // response, stop reading SSE. Defer or emit finish depending
    // on whether we enqueued parts this cycle.
    if (session.readyToFinishForTools && state.emittedToolCalls) {
      if (enqueuedSomething) return { outcome: 'yielded' }
      return { outcome: 'finish-tool-calls' }
    }

    const { done, value } = await session.reader.read()

    if (done) {
      return { outcome: 'done', emittedToolCalls: state.emittedToolCalls }
    }

    session.sseBuffer += decoder.decode(value, { stream: true })
    const events = extractSSEEvents(session)

    for (const event of events) {
      const parts = processA2AEvent(event, session)

      for (const part of parts) {
        if (part.type === 'tool-call') {
          state.emittedToolCalls = true
        }

        controller.enqueue(part)
        enqueuedSomething = true

        if (part.type === 'error') {
          return { outcome: 'error' }
        }

        if (part.type === 'finish') {
          return { outcome: 'finish', finishReason: part.finishReason }
        }
      }
    }
  }
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
  const state = { emittedToolCalls: false }
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
      if (session.readyToFinishForTools && state.emittedToolCalls) {
        finished = true
        controller.enqueue(FINISH_TOOL_CALLS)
        controller.close()
        return
      }

      try {
        const result = await readAndProcessEvents(
          session,
          decoder,
          controller,
          state
        )

        switch (result.outcome) {
          case 'yielded':
            return
          case 'finish-tool-calls':
            finished = true
            controller.enqueue(FINISH_TOOL_CALLS)
            controller.close()
            return
          case 'done':
            finished = true
            if (result.emittedToolCalls) {
              controller.enqueue(FINISH_TOOL_CALLS)
            } else {
              controller.enqueue(FINISH_STOP)
              cleanupSession()
            }
            controller.close()
            return
          case 'finish':
            finished = true
            if (result.finishReason !== 'tool-calls') {
              cleanupSession()
            }
            controller.close()
            return
          case 'error':
            finished = true
            controller.close()
            cleanupSession()
            return
        }
      } catch (error) {
        if (isAbortError(error)) {
          finished = true
          controller.close()
          cleanupSession()
          return
        }

        log.error(LOG_PREFIX, `Stream error:`, error)
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
