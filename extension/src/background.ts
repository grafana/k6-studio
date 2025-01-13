import { BrowserEvent } from '@/schemas/recording'
import { MessageEnvelope, MessagePayload } from '@/services/browser/schemas'
import { WebNavigation, webNavigation } from 'webextension-polyfill'

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

function isManualNavigation(transition: WebNavigation.TransitionType) {
  return (
    transition === 'typed' ||
    transition === 'generated' ||
    transition === 'start_page' ||
    transition === 'auto_bookmark' ||
    transition === 'keyword' ||
    transition === 'keyword_generated'
  )
}

webNavigation.onCommitted.addListener((details) => {
  if (!isManualNavigation(details.transitionType)) {
    return
  }

  captureEvents({
    type: 'page-navigation',
    eventId: crypto.randomUUID(),
    timestamp: details.timeStamp,
    tab: details.tabId.toString(),
    url: details.url ?? '',
  })
})

connect()
