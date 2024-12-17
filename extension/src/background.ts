import { MessageEnvelope, MessagePayload } from '@/services/browser/schemas'
import { browser } from 'webextension-polyfill-ts'

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

setInterval(() => {
  send({
    type: 'events-captured',
    events: [
      {
        eventId: crypto.randomUUID(),
        timestamp: Date.now(),
        type: 'dummy',
        selector: 'button',
        message: 'Clicked button',
      },
    ],
  })
}, 5000)

connect()

browser.runtime.onInstalled.addListener(() => {
  console.log('Extension installed...')
})
