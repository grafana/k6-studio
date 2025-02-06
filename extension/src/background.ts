import { BrowserEvent } from '@/schemas/recording'
import { MessageEnvelope, MessagePayload } from '@/services/browser/schemas'
import { runtime, tabs } from 'webextension-polyfill'
import { BrowserMessageSchema } from './messaging'
import { captureNavigationEvents } from './navigation'

let socket: WebSocket | null = null
let buffer: MessageEnvelope[] = []

function send(message: MessagePayload) {
  const envelope: MessageEnvelope = {
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
