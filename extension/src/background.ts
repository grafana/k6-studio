import { BrowserEvent } from '@/schemas/recording'
import {
  ClientMessage,
  ClientMessageEnvelope,
  ServerMessageEnvelopeSchema,
} from '@/services/browser/schemas'
import { Runtime, runtime, tabs } from 'webextension-polyfill'
import { BrowserMessageSchema } from './messaging'
import { captureNavigationEvents } from './navigation'

let socket: WebSocket | null = null
let buffer: ClientMessageEnvelope[] = []

let ports: Runtime.Port[] = []

runtime.onConnect.addListener((port) => {
  if (port.name === 'recorder') {
    ports.push(port)

    port.onDisconnect.addListener(() => {
      ports = ports.filter((p) => p !== port)
    })
  }
})

function send(message: ClientMessage) {
  const envelope: ClientMessageEnvelope = {
    messageId: crypto.randomUUID(),
    payload: message,
  }

  if (socket) {
    socket.send(JSON.stringify(envelope))
  } else {
    buffer.push(envelope)
  }
}

function captureEvents(events: BrowserEvent[] | BrowserEvent) {
  console.log('Captured events...', events)

  send({
    type: 'events-captured',
    events: Array.isArray(events) ? events : [events],
  })
}

function flush(socket: WebSocket) {
  for (const message of buffer) {
    socket.send(JSON.stringify(message))
  }

  buffer = []
}

function reconnect() {
  socket?.close()
  socket = null

  setTimeout(() => {
    connect()
  }, 1000)
}

function connect() {
  const ws = new WebSocket('ws://localhost:7554')

  ws.onopen = () => {
    console.log('Connected to server...')

    socket = ws

    flush(ws)
  }

  ws.onerror = (err) => {
    console.log('Connection error...', err)

    reconnect()
  }

  ws.onclose = () => {
    console.log('Connection closed...')

    reconnect()
  }

  ws.onmessage = async (message) => {
    if (typeof message.data !== 'string') {
      console.error('Received non-string message from server.', message)

      return
    }

    const envelope = ServerMessageEnvelopeSchema.safeParse(
      JSON.parse(message.data)
    )

    if (!envelope.success) {
      console.error('Failed to parse message from server.', envelope.error)

      return
    }

    console.log('Received message from server...', envelope.data.payload)

    if (envelope.data.payload.type === 'navigate-to') {
      const [tab] = await tabs.query({ active: true, currentWindow: true })

      if (tab === undefined) {
        return
      }

      await tabs.update(tab.id, { url: envelope.data.payload.url })

      return
    }

    ports.forEach((port) => {
      port.postMessage(envelope.data.payload)
    })
  }
}

runtime.onMessage.addListener((message, sender) => {
  const event = BrowserMessageSchema.safeParse(message)

  if (!event.success) {
    console.error(
      'Failed to parse message sent from content script.',
      event.error
    )

    return undefined
  }

  const tabId = sender.tab?.id ?? tabs.TAB_ID_NONE

  switch (event.data.type) {
    case 'events-captured':
      captureEvents(
        // Content scripts don't know the tab id themselves, but we do
        // get it from the sender object so we attach it here.
        event.data.events.map((event) => {
          return {
            ...event,
            tab: tabId.toString(),
          }
        })
      )
      break
  }
})

captureNavigationEvents(captureEvents)

connect()
