import { StreamTextResult, ToolSet } from 'ai'

import { AiHandler } from './types'

export async function streamMessages<Tools extends ToolSet, PARTIAL_OUTPUT>(
  webContents: Electron.WebContents,
  response: StreamTextResult<Tools, PARTIAL_OUTPUT>,
  requestId: string
) {
  const stream = response.toUIMessageStream({})

  for await (const part of stream) {
    webContents.send(AiHandler.StreamChatChunk, {
      id: requestId,
      chunk: part,
    })
  }

  const usageData = await response.usage

  webContents.send(AiHandler.StreamChatEnd, {
    id: requestId,
    usage: usageData,
  })
}
