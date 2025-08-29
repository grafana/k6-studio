import './view'

import { BrowserEvent } from '@/schemas/recording'

import { generateSelector } from '../selectors'
import {
  findAssociatedElement,
  findInteractiveElement,
  hasModifierKeys,
  isImplicitSubmitInput,
  isNativeButton,
  isNativeCheckbox,
  isNativeRadio,
} from '../utils/dom'

import { WindowEventManager } from './manager'
import { client } from './routing'

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

const manager = new WindowEventManager()

manager.capture('click', (ev, manager) => {
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

  const associatedElement = findAssociatedElement(clickTarget)

  if (associatedElement !== null) {
    // When you click on a label that is associated with a checkbox or radio,
    // the checkbox/radio will be toggled as a side-effect. This would normally
    // be recorded as a 'change' event.
    //
    // The problem is that it is a common pattern to hide the actual input element
    // and use a label as the trigger for a custom styled checkboxes/radios. This
    // doesn't play well with k6/browser, because it relies on clicks to simulate
    // checking/unchecking and if the input is obscured in some way, it will fail
    // to click it.
    //
    // So in this case, recording the click on the label is the most
    // reliable way to ensure that the action can be replayed.
    if (
      isNativeCheckbox(associatedElement) ||
      isNativeRadio(associatedElement)
    ) {
      manager.block('change', associatedElement)
    }

    // If a label is associated with a button, clicking the label will
    // trigger a simulated click on the button. To avoid recording duplicate
    // clicks, we block that second click event on the button.
    if (isNativeButton(associatedElement)) {
      manager.block('click', associatedElement)
    }
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
})

manager.capture('keydown', (ev) => {
  if (ev.target instanceof Element === false) {
    return
  }

  if (ev.repeat) {
    return
  }

  if (ev.key !== 'Enter' && ev.key !== 'Escape') {
    return
  }

  // Pressing Enter in an input of a form will trigger a click on the submit
  // submit button (if it has one). If the value of the input is changed, then
  // the order of events will be:
  //
  //   1. keydown
  //   2. change
  //   3. click
  //   4. submit
  //
  // In a generated script, we'd want to have the change before the keydown otherwise
  // the script might submit the form before the change is applied. To avoid the
  // complexity of trying to reorder events, we simply treat pressing Enter in a
  // form input as a 'click' on the submit button.
  //
  // We might want to revisit this in the future to make the behavior match more
  // closely what the user actually did.
  if (
    ev.key === 'Enter' &&
    !hasModifierKeys(ev) &&
    isImplicitSubmitInput(ev.target)
  ) {
    return
  }

  recordEvents({
    type: 'key-press',
    eventId: crypto.randomUUID(),
    timestamp: Date.now(),
    selector: generateSelector(ev.target),
    key: ev.key,
    modifiers: {
      ctrl: ev.ctrlKey,
      shift: ev.shiftKey,
      alt: ev.altKey,
      meta: ev.metaKey,
    },
    tab: '',
  })
})

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

manager.capture('change', (ev) => {
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
})
