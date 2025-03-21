import { tabs } from 'webextension-polyfill'

import { BrowserEvent } from '@/schemas/recording'

import { BrowserExtensionEvent } from './messaging/client'
import { background, frontend, studio } from './messaging/routing'
import { captureNavigationEvents } from './navigation'

captureNavigationEvents((events) => {
  background.send({
    type: 'record-events',
    events: Array.isArray(events) ? events : [events],
  })
})

const eventLog: BrowserEvent[] = []

background.on('record-events', ({ sender, data }) => {
  const events = data.events.map((event) => {
    return {
      ...event,
      tab: sender?.tab ?? event.tab,
    }
  })

  eventLog.push(...events)

  background.send({
    type: 'events-recorded',
    events,
  })
})

background.on('navigate', async ({ data }) => {
  const [tab] = await tabs.query({ active: true, currentWindow: true })

  if (tab === undefined) {
    return
  }

  await tabs.update(tab.id, { url: data.url })
})

background.on('load-events', () => {
  background.send({
    type: 'events-loaded',
    events: eventLog,
  })
})

const clients = [
  { name: 'background', client: background },
  { name: 'studio', client: studio },
  { name: 'frontend', client: frontend },
]

for (const { name, client } of clients) {
  const logEvent = (event: BrowserExtensionEvent) => {
    console.log(`[${name}] ${event.data.type}:`, event.data)
  }

  client.on('record-events', logEvent)
  client.on('highlight-element', logEvent)
  client.on('events-recorded', logEvent)
  client.on('navigate', logEvent)
}
