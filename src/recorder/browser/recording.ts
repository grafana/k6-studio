import { nanoid } from 'nanoid'

import { BrowserEvent } from '@/schemas/recording'

import {
  findAssociatedElement,
  findInteractiveElement,
  isNativeButton,
  isNativeCheckbox,
  isNativeRadio,
  isNonButtonInput,
} from '../../utils/dom/dom'
import { getElementDetails } from '../../utils/dom/selectors'

import { getFramePath, getReachableFramePath, withFrames } from './frames'
import { eventManager } from './manager'
import { BrowserExtensionClient } from './messaging'
import { getTabId } from './utils'
import { SettingsStorage } from './view/SettingsProvider'

export function startRecording(
  client: BrowserExtensionClient,
  settings: SettingsStorage
) {
  const manager = eventManager

  interface PointerDownTarget {
    target: Element
    pointerId: number
    button: number
    pointerEvents: string
  }

  let pointerDownTarget: PointerDownTarget | null = null
  let clearPointerDownTargetTimeout: ReturnType<typeof setTimeout> | null = null

  function clearPointerDownTarget() {
    pointerDownTarget = null

    if (clearPointerDownTargetTimeout !== null) {
      clearTimeout(clearPointerDownTargetTimeout)
      clearPointerDownTargetTimeout = null
    }
  }

  manager.capture('pointerdown', (ev) => {
    if (ev.isPrimary === false || ev.target instanceof Element === false) {
      return
    }

    clearPointerDownTarget()
    pointerDownTarget = {
      target: ev.target,
      pointerId: ev.pointerId,
      button: ev.button,
      // This listener runs in the capture phase before page handlers can open
      // an overlay and change hit testing for the pointer target.
      pointerEvents: getComputedStyle(ev.target).pointerEvents,
    }
  })

  manager.capture('pointerup', (ev) => {
    if (
      pointerDownTarget === null ||
      pointerDownTarget.pointerId !== ev.pointerId
    ) {
      return
    }

    // A browser-generated click follows pointerup synchronously. Do not let a
    // sequence that produced no click affect an activation in a later task.
    clearPointerDownTargetTimeout = setTimeout(clearPointerDownTarget, 0)
  })

  manager.capture('pointercancel', (ev) => {
    if (
      pointerDownTarget !== null &&
      pointerDownTarget.pointerId === ev.pointerId
    ) {
      clearPointerDownTarget()
    }
  })

  function recoverPointerDownTarget(ev: MouseEvent): Element | null {
    // Keyboard activation and HTMLElement.click() produce clicks with detail 0.
    // They must keep the click event's own target even if a pointer sequence is
    // pending at the same time.
    if (ev.detail === 0 || pointerDownTarget === null) {
      return null
    }

    const pointer = pointerDownTarget
    clearPointerDownTarget()

    if (
      pointer.button !== ev.button ||
      pointer.pointerEvents === 'none' ||
      !pointer.target.isConnected ||
      ev.target instanceof Element === false ||
      !ev.target.contains(pointer.target)
    ) {
      return null
    }

    // Radix and Material UI can make the page non-interactive while opening a
    // modal during pointerdown. The browser then retargets the resulting click
    // to an ancestor (usually body). Recover only that specific mutation so
    // ordinary drag/release retargeting keeps the browser's click target.
    if (getComputedStyle(pointer.target).pointerEvents !== 'none') {
      return null
    }

    return pointer.target
  }

  function findClickTarget(element: Element): Element | null {
    switch (settings.getCurrent().clickRecordingMode) {
      case 'interactive-only':
        return findInteractiveElement(element)

      case 'any':
        // From the user's point of view, they clicked a button and not a `<span />` inside a
        // button. So whenever we record a click we try to find the underlying interactive
        // element. Only if there's no such element do we record a click on the actual
        // target.
        return findInteractiveElement(element) ?? element

      default:
        return null
    }
  }

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
    const list = Array.isArray(events) ? events : [events]

    // All events captured in this listener happened in the current frame, so
    // they share the same frame path.
    let frames: ReturnType<typeof getFramePath>
    try {
      frames = getFramePath()
    } catch {
      // CDP retains the event if this click destroys the frame's execution context.
      const suffix = getReachableFramePath()
      window.__K6_STUDIO_RECORD_FRAME_EVENTS__?.(
        JSON.stringify(list.map((event) => withFrames(event, suffix)))
      )
      return
    }
    client.send({
      type: 'record-events',
      events: list.map((event) => withFrames(event, frames)),
    })
  }

  manager.capture('click', (ev, manager) => {
    if (ev.target instanceof Element === false) {
      return
    }

    const clickTarget = findClickTarget(
      recoverPointerDownTarget(ev) ?? ev.target
    )

    // We don't want to capture clicks on form elements since they will be
    // interacted with using e.g. the `selectOption` or `type` functions.
    if (
      clickTarget === null ||
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
      target: getElementDetails(clickTarget),
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
      target: getElementDetails(target),
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
      target: getElementDetails(target),
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
        target: getElementDetails(target),
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
        target: getElementDetails(target),
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
      target: getElementDetails(target),
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
      form: getElementDetails(ev.target),
      submitter: getElementDetails(ev.submitter),
      tab: getTabId(),
    })
  })

  return function dispose() {
    clearPointerDownTarget()
    manager.dispose()
  }
}
