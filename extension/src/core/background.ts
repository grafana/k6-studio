import { runtime, tabs } from 'webextension-polyfill'

import { BrowserEvent } from '@/schemas/recording'

import { BrowserExtensionClient, BrowserExtensionEvent } from '../messaging'

import { NavigationEventEmitter } from './types'

interface InitializeRecorderOptions {
  client: BrowserExtensionClient
  navigation: NavigationEventEmitter
}

export function initializeBackgroundRecorder({
  client,
  navigation,
}: InitializeRecorderOptions) {
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

  navigation.on('navigate', ({ events }) => {
    client.send({
      type: 'record-events',
      events,
    })
  })
}
