import { StreamTextResult, ToolSet } from 'ai'
import log from 'electron-log/main'

import {
  AiHandler,
  StreamChatChunk,
  StreamChatEnd,
  StreamChatError,
} from './types'

export async function streamMessages<Tools extends ToolSet, PARTIAL_OUTPUT>(
  webContents: Electron.WebContents,
  response: StreamTextResult<Tools, PARTIAL_OUTPUT>,
  requestId: string
) {
  try {
    const uiStream = response.toUIMessageStream({
      onError: (error) => {
        // Throw tools errors, without this they get silenced
        throw error
      },
    })

    // Process the stream and send chunks via IPC
    const reader = uiStream.getReader()
    let done = false

    while (!done) {
      const result = await reader.read()
      done = result.done || false

      if (done) {
        // Send end event
        webContents.send(AiHandler.StreamChatEnd, {
          id: requestId,
        } satisfies StreamChatEnd)
        break
      }

      // Send chunk event
      webContents.send(AiHandler.StreamChatChunk, {
        id: requestId,
        chunk: result.value,
      } satisfies StreamChatChunk)
    }
  } catch (error) {
    log.error('Error in handleStreamChat:', error)

    // Send error event
    webContents.send(AiHandler.StreamChatError, {
      id: requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    } satisfies StreamChatError)
  }
}
