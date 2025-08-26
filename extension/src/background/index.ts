import { runtime, tabs } from 'webextension-polyfill'

import { BrowserEvent } from '@/schemas/recording'

import { BrowserExtensionEvent } from '../messaging'

import { captureNavigationEvents } from './navigation'
import { client } from './routing'

const eventLog: BrowserEvent[] = []

client.on('record-events', ({ sender, data }) => {
  const events = data.events.map((event) => {
    return {
      ...event,
      tab: sender?.tab ?? event.tab,
    }
  })

  eventLog.push(...events)

  client.send({
    type: 'events-recorded',
    events,
  })
})

client.on('navigate', async ({ data }) => {
  const [tab] = await tabs.query({ active: true, currentWindow: true })

  if (tab === undefined) {
    return
  }

  await tabs.update(tab.id, { url: data.url })
})

client.on('load-events', () => {
  client.send({
    type: 'events-loaded',
    events: eventLog,
  })
})

client.on('reload-extension', () => {
  console.log('reloading extension...')

  runtime.reload()
})

const logEvent = (event: BrowserExtensionEvent) => {
  console.log(`[background] ${event.data.type}:`, event.data)
}

client.on('record-events', logEvent)
client.on('highlight-elements', logEvent)
client.on('events-recorded', logEvent)
client.on('navigate', logEvent)

captureNavigationEvents((events) => {
  client.send({
    type: 'record-events',
    events: Array.isArray(events) ? events : [events],
  })
})
