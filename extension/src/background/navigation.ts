import { tabs, WebNavigation, webNavigation } from 'webextension-polyfill'

import { BrowserEvent } from '@/schemas/recording'

import { NavigationEventMap } from '../core/types'
import { EventEmitter } from '../utils/events'

function isReload({ transitionType }: WebNavigation.OnCommittedDetailsType) {
  return transitionType === 'reload'
}

function isAddressBarNavigation({
  transitionType,
}: WebNavigation.OnCommittedDetailsType) {
  return transitionType === 'typed' || transitionType === 'start_page'
}

function isHistoryNavigation({
  transitionType,
  transitionQualifiers,
}: WebNavigation.OnCommittedDetailsType) {
  return (
    transitionType === 'link' && transitionQualifiers.includes('forward_back')
  )
}

function getNavigationSource(details: WebNavigation.OnCommittedDetailsType) {
  if (isHistoryNavigation(details)) {
    return 'history'
  }

  if (isAddressBarNavigation(details)) {
    return 'address-bar'
  }

  return null
}

export function captureNavigationEvents(
  onCaptured: (events: BrowserEvent[] | BrowserEvent) => void
) {
  webNavigation.onCommitted.addListener((details) => {
    console.log('onCommitted', details)

    if (isReload(details)) {
      onCaptured({
        type: 'reload-page',
        eventId: crypto.randomUUID(),
        timestamp: details.timeStamp,
        tab: details.tabId.toString(),
        url: details.url ?? '',
      })

      return
    }

    const source = getNavigationSource(details)

    if (source === null) {
      return
    }

    onCaptured({
      type: 'navigate-to-page',
      eventId: crypto.randomUUID(),
      timestamp: details.timeStamp,
      tab: details.tabId.toString(),
      url: details.url ?? '',
      source,
    })
  })

  webNavigation.onHistoryStateUpdated.addListener((details) => {
    console.log('onHistoryStateUpdated', details)

    if (isHistoryNavigation(details)) {
      onCaptured({
        type: 'navigate-to-page',
        eventId: crypto.randomUUID(),
        timestamp: details.timeStamp,
        tab: details.tabId.toString(),
        url: details.url ?? '',
        source: 'history',
      })

      return
    }
  })

  tabs
    .query({ active: true, currentWindow: true })
    .then((tabs) => {
      for (const tab of tabs) {
        // If the pendingUrl is set, it means that the navigation hasn't been
        // comitted yet so the onCommited handler will record the navigation.
        if (tab.pendingUrl !== undefined) {
          continue
        }

        if (
          tab.id === undefined ||
          tab.url === undefined ||
          tab.url.startsWith('chrome://')
        ) {
          continue
        }

        onCaptured({
          type: 'navigate-to-page',
          eventId: crypto.randomUUID(),
          timestamp: Date.now(),
          tab: tab.id.toString(),
          url: tab.url,
          source: 'address-bar',
        })
      }
    })
    .catch((error) => {
      console.error('Error getting active tab:', error)
    })
}

export class ExtensionNavigationListener extends EventEmitter<NavigationEventMap> {
  constructor() {
    super()

    captureNavigationEvents((events) => {
      this.emit('navigate', {
        events: Array.isArray(events) ? events : [events],
      })
    })
  }
}
