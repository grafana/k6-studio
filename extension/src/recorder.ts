import { BrowserEvent } from '@/schemas/recording'
import { runtime } from 'webextension-polyfill'
import { generateSelector } from './selectors'

function getButton(button: number) {
  switch (button) {
    case 0:
      return 'left'

    case 1:
      return 'middle'

    case 2:
      return 'right'

    default:
      return null
  }
}

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
    if (ev.target instanceof Element !== true) {
      return
    }

    const button = getButton(ev.button)

    if (button === null) {
      return
    }

    captureEvents({
      type: 'click',
      eventId: crypto.randomUUID(),
      timestamp: Date.now(),
      selector: generateSelector(ev.target),
      button,
      modifiers: {
        ctrl: ev.ctrlKey,
        shift: ev.shiftKey,
        alt: ev.altKey,
        meta: ev.metaKey,
      },
      tab: '',
    })
  },
  { capture: true, passive: true }
)
