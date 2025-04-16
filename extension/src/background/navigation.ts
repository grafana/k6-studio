import { WebNavigation, webNavigation } from 'webextension-polyfill'

import { BrowserEvent } from '@/schemas/recording'

function isReload({ transitionType }: WebNavigation.OnCommittedDetailsType) {
  return transitionType === 'reload'
}

function isAddressBarNavigation({
  transitionType,
}: WebNavigation.OnCommittedDetailsType) {
  return (
    transitionType === 'typed' ||
    transitionType === 'generated' ||
    transitionType === 'start_page' ||
    transitionType === 'auto_bookmark' ||
    transitionType === 'keyword' ||
    transitionType === 'keyword_generated'
  )
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
        type: 'reloaded-page',
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
      type: 'navigated-to-page',
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
        type: 'navigated-to-page',
        eventId: crypto.randomUUID(),
        timestamp: details.timeStamp,
        tab: details.tabId.toString(),
        url: details.url ?? '',
        source: 'history',
      })

      return
    }
  })
}
