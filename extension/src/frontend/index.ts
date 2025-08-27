import './view'

import { BrowserEvent } from '@/schemas/recording'

import { generateSelector } from '../selectors'
import { findInteractiveElement } from '../utils/dom'

import { client } from './routing'
import { shouldSkipEvent } from './view/utils'

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

function recordEvents(events: BrowserEvent[] | BrowserEvent) {
  client.send({
    type: 'record-events',
    events: Array.isArray(events) ? events : [events],
  })
}

window.addEventListener(
  'click',
  (ev) => {
    if (shouldSkipEvent(ev)) {
      return
    }

    if (ev.target instanceof Element === false) {
      return
    }

    // From the user's point of view, they clicked a button and not a `<span />` inside a
    // button. So whenever we record a click we try to find the underlying interactive
    // element. Only if there's no such element do we record a click on the actual
    // target.
    //
    // In the future, we might want to have this behavior configurable:
    //
    // - Ignore any click on non-interactive elements
    // - Record click on the interactive element with fallback (current behavior).
    // - Record all clicks exactly as they happened.
    //
    // The first option would be especially useful since it can reduce noise
    // in the recordings.
    const clickTarget = findInteractiveElement(ev.target) ?? ev.target

    // We don't want to capture clicks on form elements since they will be
    // interacted with using e.g. the `selectOption` or `type` functions.
    if (
      clickTarget instanceof HTMLInputElement ||
      clickTarget instanceof HTMLTextAreaElement ||
      clickTarget instanceof HTMLSelectElement ||
      clickTarget instanceof HTMLOptionElement
    ) {
      return
    }

    const button = getButton(ev.button)

    if (button === null) {
      return
    }

    recordEvents({
      type: 'click',
      eventId: crypto.randomUUID(),
      timestamp: Date.now(),
      selector: generateSelector(clickTarget),
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
  recordEvents({
    type: 'select-change',
    eventId: crypto.randomUUID(),
    timestamp: Date.now(),
    selector: generateSelector(target),
    selected: [...target.selectedOptions].map((option) => option.value),
    multiple: target.multiple,
    tab: '',
  })
}

function handleTextAreaChange(target: HTMLTextAreaElement) {
  recordEvents({
    type: 'input-change',
    eventId: crypto.randomUUID(),
    timestamp: Date.now(),
    selector: generateSelector(target),
    value: target.value,
    sensitive: false,
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
    recordEvents({
      type: 'check-change',
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

    recordEvents({
      type: 'radio-change',
      eventId: crypto.randomUUID(),
      timestamp: Date.now(),
      selector: generateSelector(target),
      name: target.name,
      value: target.value,
      tab: '',
    })

    return
  }

  recordEvents({
    type: 'input-change',
    eventId: crypto.randomUUID(),
    timestamp: Date.now(),
    selector: generateSelector(target),
    value: target.value,
    sensitive: target.type === 'password',
    tab: '',
  })
}

window.addEventListener(
  'change',
  (ev) => {
    if (shouldSkipEvent(ev)) {
      return
    }

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

window.addEventListener('submit', (ev) => {
  if (shouldSkipEvent(ev)) {
    return
  }

  if (ev.target instanceof Element === false) {
    return
  }

  // The `submitter` property will be null if the submission was triggered by a script.
  // In that case, we will assume that there was some other recorded action that caused
  // that script to run.
  if (ev.submitter === null) {
    return
  }

  recordEvents({
    type: 'submit-form',
    eventId: crypto.randomUUID(),
    timestamp: Date.now(),
    form: generateSelector(ev.target),
    submitter: generateSelector(ev.submitter),
    tab: '',
  })
})
