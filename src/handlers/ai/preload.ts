import { ipcRenderer } from 'electron'

import {
  AbortStreamChatRequest,
  AiHandler,
  StreamChatChunk,
  StreamChatEnd,
  StreamChatRequest,
  TokenUsage,
} from './types'

export function streamChat(request: StreamChatRequest) {
  // Send the initial request
  ipcRenderer.send(AiHandler.StreamChat, request)

  // Return an object with methods to listen for stream events
  return {
    onChunk: (callback: (chunk: StreamChatChunk) => void) => {
      const handler = (
        _event: Electron.IpcRendererEvent,
        data: StreamChatChunk
      ) => {
        if (data.id === request.id) {
          callback(data)
        }
      }
      ipcRenderer.on(AiHandler.StreamChatChunk, handler)
      return () =>
        ipcRenderer.removeListener(AiHandler.StreamChatChunk, handler)
    },

    onEnd: (callback: (usage?: TokenUsage) => void) => {
      const handler = (
        _event: Electron.IpcRendererEvent,
        data: StreamChatEnd
      ) => {
        if (data.id === request.id) {
          callback(data.usage)
        }
      }
      ipcRenderer.on(AiHandler.StreamChatEnd, handler)
      return () => ipcRenderer.removeListener(AiHandler.StreamChatEnd, handler)
    },

    abort: () => {
      const abortRequest: AbortStreamChatRequest = { id: request.id }
      ipcRenderer.send(AiHandler.AbortStreamChat, abortRequest)
    },
  }
}
