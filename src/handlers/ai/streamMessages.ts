import { StreamTextResult, ToolSet } from 'ai'
import log from 'electron-log/main'

import { AiHandler } from './types'

const PREFIX = '[streamMessages]'

export async function streamMessages<Tools extends ToolSet, PARTIAL_OUTPUT>(
  webContents: Electron.WebContents,
  response: StreamTextResult<Tools, PARTIAL_OUTPUT>,
  requestId: string
) {
  log.info(PREFIX, `Starting stream for requestId=${requestId}`)
  const stream = response.toUIMessageStream({})

  let chunkCount = 0
  for await (const part of stream) {
    chunkCount++
    log.info(
      PREFIX,
      `Chunk #${chunkCount} type=${part.type}`,
      JSON.stringify(part).slice(0, 200)
    )
    webContents.send(AiHandler.StreamChatChunk, {
      id: requestId,
      chunk: part,
    })
  }

  log.info(
    PREFIX,
    `Stream ended, sent ${chunkCount} chunks. Sending StreamChatEnd.`
  )
  webContents.send(AiHandler.StreamChatEnd, {
    id: requestId,
  })
}
