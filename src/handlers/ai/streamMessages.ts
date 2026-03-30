import { StreamTextResult, ToolSet } from 'ai'

import type { AssistantErrorInfo } from '@/types/assistant'

import { AssistantError } from './a2a/classifyError'
import { AiHandler, StreamChatChunk } from './types'

export async function streamMessages<Tools extends ToolSet, PARTIAL_OUTPUT>(
  webContents: Electron.WebContents,
  response: StreamTextResult<Tools, PARTIAL_OUTPUT>,
  requestId: string,
  includeUsage: boolean
) {
  let capturedErrorInfo: AssistantErrorInfo | undefined

  const stream = response.toUIMessageStream({
    onError(error: unknown) {
      if (error instanceof AssistantError) {
        capturedErrorInfo = error.errorInfo
      }
      return error instanceof Error ? error.message : String(error)
    },
  })

  for await (const part of stream) {
    const chunk: StreamChatChunk = {
      id: requestId,
      chunk: part,
    }

    if (part.type === 'error' && capturedErrorInfo) {
      chunk.errorInfo = capturedErrorInfo
    }

    webContents.send(AiHandler.StreamChatChunk, chunk)
  }

  const usageData = includeUsage ? await response.usage : undefined

  webContents.send(AiHandler.StreamChatEnd, {
    id: requestId,
    usage: usageData,
  })
}
