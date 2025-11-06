import { nanoid } from 'nanoid'

import { BrowserEvent } from '@/schemas/recording'

import { BrowserExtensionClient } from '../messaging'
import { getEventTarget } from '../target'
import {
  findAssociatedElement,
  findInteractiveElement,
  isNativeButton,
  isNativeCheckbox,
  isNativeRadio,
  isNonButtonInput,
} from '../utils/dom'

import { WindowEventManager } from './manager'
import { getTabId } from './utils'

export function startRecording(client: BrowserExtensionClient) {
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
      isNonButtonInput(clickTarget) ||
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
      eventId: nanoid(),
      timestamp: Date.now(),
      target: getEventTarget(clickTarget),
      button,
      modifiers: {
        ctrl: ev.ctrlKey,
        shift: ev.shiftKey,
        alt: ev.altKey,
        meta: ev.metaKey,
      },
      tab: getTabId(),
    })
  })

  function handleSelectChange(target: HTMLSelectElement) {
    recordEvents({
      type: 'select-change',
      eventId: nanoid(),
      timestamp: Date.now(),
      target: getEventTarget(target),
      selected: [...target.selectedOptions].map((option) => option.value),
      multiple: target.multiple,
      tab: getTabId(),
    })
  }

  function handleTextAreaChange(target: HTMLTextAreaElement) {
    recordEvents({
      type: 'input-change',
      eventId: nanoid(),
      timestamp: Date.now(),
      target: getEventTarget(target),
      value: target.value,
      sensitive: false,
      tab: getTabId(),
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
        eventId: nanoid(),
        timestamp: Date.now(),
        target: getEventTarget(target),
        checked: target.checked,
        tab: getTabId(),
      })

      return
    }

    if (target.type === 'radio') {
      if (!target.checked) {
        return
      }

      recordEvents({
        type: 'radio-change',
        eventId: nanoid(),
        timestamp: Date.now(),
        target: getEventTarget(target),
        name: target.name,
        value: target.value,
        tab: getTabId(),
      })

      return
    }

    recordEvents({
      type: 'input-change',
      eventId: nanoid(),
      timestamp: Date.now(),
      target: getEventTarget(target),
      value: target.value,
      sensitive: target.type === 'password',
      tab: getTabId(),
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

  manager.capture('submit', (ev) => {
    if (ev.target instanceof Element === false) {
      return
    }

    // The `submitter` property will be null if the submission was triggered by a script.
    // In that case, we will assume that there was some other recorded action that caused
    // that script to run.
    if (ev.submitter === null) {
      return
    }

    // We might have already recorded a click on the submit button. In the future we might
    // want to replace the previous click with the form submission, but for now we will
    // just skip recording the submission.
    const hasClickedSubmit = manager.history.some(
      (prev) => prev.type === 'click' && prev.target === ev.submitter
    )

    if (hasClickedSubmit) {
      return
    }

    recordEvents({
      type: 'submit-form',
      eventId: nanoid(),
      timestamp: Date.now(),
      form: getEventTarget(ev.target),
      submitter: getEventTarget(ev.submitter),
      tab: getTabId(),
    })
  })
}
