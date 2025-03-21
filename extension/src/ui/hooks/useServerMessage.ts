import { useEffect, useRef } from 'react'
import { runtime } from 'webextension-polyfill'

import { ServerMessage, ServerMessageSchema } from '@/services/browser/schemas'

let listeners: Array<(message: ServerMessage) => void> = []

let port = runtime.connect({ name: 'recorder' })

port.onMessage.addListener((message) => {
  const parsed = ServerMessageSchema.safeParse(message)

  if (!parsed.success) {
    console.error('Received invalid message', message)

    return undefined
  }

  for (const listener of listeners) {
    try {
      listener(parsed.data)
    } catch (error) {
      console.error('Failed to handle message', error)
    }
  }

  return undefined
})

port.onDisconnect.addListener(() => {
  console.warn('Port disconnected')

  port = runtime.connect({ name: 'recorder' })
})

export function useServerMessage(callback: (message: ServerMessage) => void) {
  const callbackRef = useRef(callback)

  useEffect(() => {
    const listener = (message: ServerMessage) => {
      callbackRef.current(message)
    }

    listeners.push(listener)

    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  }, [])

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])
}
