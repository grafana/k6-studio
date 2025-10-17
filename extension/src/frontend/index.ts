import { storage } from 'webextension-polyfill'

import { BrowserToStudioClient } from '../core/clients/browserToStudio'
import { serve } from '../core/clients/messaging/server'
import { ContentScriptTransport } from '../core/clients/messaging/transports/contentScript'
import {
  studioToBrowserEvents,
  studioToBrowserMethods,
} from '../core/clients/studioToBrowser'
import { initializeFrontendRecorder } from '../core/frontend'
import { StorageBackend } from '../core/settings'

import { initializeView } from './view'
import { useInBrowserUIStore } from './view/store'

const extensionStorage: StorageBackend = {
  get(defaults: Record<string, unknown>) {
    return storage.local.get(defaults)
  },
  set(data) {
    return storage.local.set(data)
  },
}

const transport = new ContentScriptTransport('recorder')

serve({
  transport,
  events: studioToBrowserEvents,
  methods: studioToBrowserMethods,
  handlers: {
    highlightElement(selector) {
      useInBrowserUIStore.getState().highlightElements(selector)
    },
  },
})

const client = new BrowserToStudioClient(transport)

initializeFrontendRecorder(client)
initializeView(client, extensionStorage)
