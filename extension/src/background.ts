import { BrowserEvent } from '@/schemas/recording'
import { MessageEnvelope, MessagePayload } from '@/services/browser/schemas'
import {
  WebNavigation,
  webNavigation,
  runtime,
  tabs,
} from 'webextension-polyfill'
import { BrowserMessageSchema } from './messaging'

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

function isReload(transition: WebNavigation.TransitionType) {
  return transition === 'reload'
}

function isManualNavigation({
  transitionType,
  transitionQualifiers,
}: WebNavigation.OnCommittedDetailsType) {
  if (
    transitionType === 'typed' ||
    transitionType === 'generated' ||
    transitionType === 'start_page' ||
    transitionType === 'auto_bookmark' ||
    transitionType === 'keyword' ||
    transitionType === 'keyword_generated'
  ) {
    return true
  }

  // If a user navigates back or forward to a page that was navigated to by a link
  // we treat that as a manual navigation.
  return (
    transitionQualifiers.includes('forward_back') && transitionType === 'link'
  )
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

webNavigation.onCommitted.addListener((details) => {
  if (isReload(details.transitionType)) {
    captureEvents({
      type: 'page-reload',
      eventId: crypto.randomUUID(),
      timestamp: details.timeStamp,
      tab: details.tabId.toString(),
      url: details.url ?? '',
    })

    return
  }

  if (!isManualNavigation(details)) {
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
