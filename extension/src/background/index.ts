import { runtime, tabs } from 'webextension-polyfill'

import { BrowserEvent } from '@/schemas/recording'

import {
  BrowserToStudioClient,
  browserToStudioEvents,
  browserToStudioMethods,
} from '../core/clients/browserToStudio'
import { serve } from '../core/clients/messaging/server'
import { BackgroundScriptTransport } from '../core/clients/messaging/transports/backgroundScript'
import { WebSocketTransport } from '../core/clients/messaging/transports/webSocket'
import {
  StudioToBrowserClient,
  studioToBrowserEvents,
  studioToBrowserMethods,
} from '../core/clients/studioToBrowser'

import { captureNavigationEvents } from './navigation'

const events: BrowserEvent[] = []

const backgroundTransport = new BackgroundScriptTransport()
const studioWebSocketTransport = new WebSocketTransport('ws://localhost:7554')

const browserToStudioClient = new BrowserToStudioClient(
  studioWebSocketTransport
)
const studioToBrowserClient = new StudioToBrowserClient(backgroundTransport)

// Serves requests coming from content scripts.
const contentScriptServer = serve({
  transport: backgroundTransport,
  events: browserToStudioEvents,
  methods: browserToStudioMethods,
  handlers: {
    loadEvents() {
      return events
    },

    async recordEvents(newEvents: BrowserEvent[]) {
      const eventsWithTabId = newEvents.map((event) => {
        return {
          ...event,
          tab: this.sender ?? event.tab,
        }
      })

      await browserToStudioClient.recordEvents(eventsWithTabId)

      events.push(...eventsWithTabId)

      this.emit('record', { events: eventsWithTabId })
    },

    async navigateTo(url: string) {
      await tabs.update(undefined, { url })
    },

    stopRecording() {
      return browserToStudioClient.stopRecording()
    },

    reload() {
      runtime.reload()
    },
  },
})

captureNavigationEvents((events) => {
  contentScriptServer.handlers
    .recordEvents(Array.of(events).flat())
    .catch((error) => {
      console.error('Failed to record navigation events:', error)
    })
})

// Serves requests coming from the Studio app.
serve({
  transport: studioWebSocketTransport,
  events: studioToBrowserEvents,
  methods: studioToBrowserMethods,
  handlers: {
    highlightElement(selector) {
      return studioToBrowserClient.highlightElement(selector)
    },

    navigateTo(url) {
      return contentScriptServer.handlers.navigateTo(url)
    },
  },
})
