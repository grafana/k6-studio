import { BrowserEvent } from '@/schemas/recording'
import { WebNavigation, webNavigation } from 'webextension-polyfill'

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

function isInteractionNavigation({
  transitionType,
  transitionQualifiers,
}: WebNavigation.OnCommittedDetailsType) {
  if (transitionType === 'form_submit') {
    return true
  }

  return (
    transitionType === 'link' && !transitionQualifiers.includes('forward_back')
  )
}

function getNavigationSource(details: WebNavigation.OnCommittedDetailsType) {
  if (isHistoryNavigation(details)) {
    return 'history'
  }

  if (isAddressBarNavigation(details)) {
    return 'address-bar'
  }

  if (isInteractionNavigation(details)) {
    return 'interaction'
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
        type: 'page-reload',
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
      type: 'page-navigation',
      eventId: crypto.randomUUID(),
      timestamp: details.timeStamp,
      tab: details.tabId.toString(),
      url: details.url ?? '',
      source,
    })
  })

  webNavigation.onHistoryStateUpdated.addListener((details) => {
    if (isHistoryNavigation(details)) {
      onCaptured({
        type: 'page-navigation',
        eventId: crypto.randomUUID(),
        timestamp: details.timeStamp,
        tab: details.tabId.toString(),
        url: details.url ?? '',
        source: 'history',
      })

      return
    }

    onCaptured({
      type: 'page-navigation',
      eventId: crypto.randomUUID(),
      timestamp: details.timeStamp,
      tab: details.tabId.toString(),
      url: details.url ?? '',
      source: 'script',
    })
  })
}
