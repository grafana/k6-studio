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

function handleSelectChange(target: HTMLSelectElement) {
  captureEvents({
    type: 'select',
    eventId: crypto.randomUUID(),
    timestamp: Date.now(),
    selector: generateSelector(target),
    selected: [...target.selectedOptions].map((option) => option.value),
    tab: '',
  })
}

function handleTextAreaChange(target: HTMLTextAreaElement) {
  captureEvents({
    type: 'input-change',
    eventId: crypto.randomUUID(),
    timestamp: Date.now(),
    selector: generateSelector(target),
    value: target.value,
    tab: '',
  })
}

function handleInputChange(target: HTMLInputElement) {
  if (
    target.type === 'button' ||
    target.type === 'submit' ||
    target.type === 'reset' ||
    target.type === 'file' ||
    target.type === 'image'
  ) {
    return
  }

  if (target.type === 'checkbox') {
    captureEvents({
      type: 'check',
      eventId: crypto.randomUUID(),
      timestamp: Date.now(),
      selector: generateSelector(target),
      checked: target.checked,
      tab: '',
    })

    return
  }

  if (target.type === 'radio') {
    if (!target.checked) {
      return
    }

    captureEvents({
      type: 'switch',
      eventId: crypto.randomUUID(),
      timestamp: Date.now(),
      selector: generateSelector(target),
      name: target.name,
      value: target.value,
      tab: '',
    })

    return
  }

  captureEvents({
    type: 'input-change',
    eventId: crypto.randomUUID(),
    timestamp: Date.now(),
    selector: generateSelector(target),
    value: target.value,
    tab: '',
  })
}

window.addEventListener(
  'change',
  (ev) => {
    if (ev.target instanceof HTMLTextAreaElement) {
      handleTextAreaChange(ev.target)

      return
    }

    if (ev.target instanceof HTMLSelectElement) {
      handleSelectChange(ev.target)

      return
    }

    if (ev.target instanceof HTMLInputElement) {
      handleInputChange(ev.target)

      return
    }
  },
  { capture: true, passive: true }
)
