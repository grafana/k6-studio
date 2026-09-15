import { streamText } from 'ai'

import { AiHandler } from './types'

// ai v7 added a runtime-context type parameter to StreamTextResult, and its
// output constraint is not reachable from the package's public exports, so the
// response type is derived from streamText itself.
type StreamTextResponse = ReturnType<typeof streamText>

export async function streamMessages(
  webContents: Electron.WebContents,
  response: StreamTextResponse,
  requestId: string
): Promise<void> {
  const stream = response.toUIMessageStream({})

  for await (const part of stream) {
    webContents.send(AiHandler.StreamChatChunk, {
      id: requestId,
      chunk: part,
    })
  }

  webContents.send(AiHandler.StreamChatEnd, {
    id: requestId,
  })
}
