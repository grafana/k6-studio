import { BrowserEvent } from '@/schemas/recording'
import { runtime } from 'webextension-polyfill'
import { generateSelector } from './selectors'

// Technically we can't rely on the button index because a user could re-assign
// the meaning of the button but it's a fringe case.
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
    if (ev.target instanceof Element === false) {
      return
    }

    // We don't want to capture clicks on form elements since they will be
    // interacted with using e.g. the `selectOption` or `type` functions.
    if (
      ev.target instanceof HTMLInputElement ||
      ev.target instanceof HTMLTextAreaElement ||
      ev.target instanceof HTMLSelectElement ||
      ev.target instanceof HTMLOptionElement
    ) {
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

window.addEventListener(
  'change',
  (ev) => {
    if (
      ev.target instanceof HTMLInputElement === false &&
      ev.target instanceof HTMLTextAreaElement === false
    ) {
      return
    }

    if (
      ev.target.type === 'button' ||
      ev.target.type === 'submit' ||
      ev.target.type === 'reset' ||
      ev.target.type === 'check' ||
      ev.target.type === 'file' ||
      ev.target.type === 'image'
    ) {
      return
    }

    captureEvents({
      type: 'input-change',
      eventId: crypto.randomUUID(),
      timestamp: Date.now(),
      selector: generateSelector(ev.target),
      value: ev.target.value,
      tab: '',
    })
  },
  { capture: true, passive: true }
)
