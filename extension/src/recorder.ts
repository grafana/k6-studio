import { BrowserEvent } from '@/schemas/recording'
import { runtime } from 'webextension-polyfill'
import { generateSelector } from './selectors'

function captureEvents(events: BrowserEvent[] | BrowserEvent) {
  runtime
    .sendMessage({
      type: 'events-captured',
      events: Array.isArray(events) ? events : [events],
    })
    .catch(console.error)
}

window.addEventListener(
  'click',
  (ev) => {
    if (
      ev.target instanceof HTMLButtonElement ||
      ev.target instanceof HTMLAnchorElement
    ) {
      captureEvents({
        type: 'click',
        eventId: crypto.randomUUID(),
        timestamp: Date.now(),
        selector: generateSelector(ev.target),
        tab: '',
      })

      return
    }
  },
  { capture: true, passive: true }
)
