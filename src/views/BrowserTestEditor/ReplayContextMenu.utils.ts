import { PlayerMouseEvent } from '@/components/SessionPlayer/SessionPlayer.hooks'
import { AnyBrowserAction } from '@/schemas/browserTest'
import { LocatorOptions } from '@/schemas/locator'
import { getAriaDetails } from '@/utils/dom/aria'
import { findInteractiveElement } from '@/utils/dom/dom'
import { forEachOwningFrame } from '@/utils/dom/frameChain'
import {
  isHTMLInputElement,
  isHTMLSelectElement,
  isHTMLTextAreaElement,
} from '@/utils/dom/realm'
import { generateSelectors, getElementDetails } from '@/utils/dom/selectors'
import { emptyToUndefined } from '@/utils/list'
import { toLocatorOptions } from '@/utils/locator'

import { ContextMenuState } from './types'

// Input types whose value is plain text (as opposed to e.g. checkbox/radio/file).
const TEXT_INPUT_TYPES = [
  'text',
  'email',
  'password',
  'search',
  'url',
  'tel',
  'number',
  '',
]

export function isTextInput(element: Element, roles: string[]): boolean {
  if (isHTMLTextAreaElement(element)) {
    return true
  }

  if (isHTMLInputElement(element)) {
    return TEXT_INPUT_TYPES.includes(element.type.toLowerCase())
  }

  return roles.includes('textbox') || roles.includes('searchbox')
}

export function isCheckbox(element: Element, roles: string[]): boolean {
  if (isHTMLInputElement(element) && element.type === 'checkbox') {
    return true
  }

  return roles.includes('checkbox') || roles.includes('switch')
}

export function isRadio(element: Element, roles: string[]): boolean {
  if (isHTMLInputElement(element) && element.type === 'radio') {
    return true
  }

  return roles.includes('radio')
}

export function isSelect(element: Element, roles: string[]): boolean {
  if (isHTMLSelectElement(element)) {
    return true
  }

  return roles.includes('combobox') || roles.includes('listbox')
}

export function getTextInputValue(element: Element): string {
  if (isHTMLTextAreaElement(element)) {
    return element.value
  }

  if (
    isHTMLInputElement(element) &&
    TEXT_INPUT_TYPES.includes(element.type.toLowerCase())
  ) {
    return element.value
  }

  return element.textContent
}

/**
 * Builds the chain of iframe locators (outermost first) that `element` lives in,
 * walking up the replay DOM. Stops at the SessionPlayer's own iframe, which
 * lives in `appWindow`'s document and isn't part of the recorded page. Returns
 * undefined for elements in the top frame.
 */
export function buildFrameChainFromElement(
  element: Element,
  appWindow: Window = window
): LocatorOptions[] | undefined {
  const chain: LocatorOptions[] = []

  try {
    forEachOwningFrame(
      element.ownerDocument.defaultView,
      // Stop at the SessionPlayer's own iframe, which lives directly in
      // appWindow's document and isn't part of the recorded page.
      (win) => win === appWindow || win.parent === appWindow,
      (iframe) =>
        chain.unshift(toLocatorOptions(getElementDetails(iframe).selectors))
    )
  } catch {
    // A frame we can't walk through would yield a partial chain that resolves
    // against the wrong frame, so fall back to no frame chain.
    return undefined
  }

  return emptyToUndefined(chain)
}

/**
 * Attaches a frame chain to a locator-based action. Page-level actions and
 * top-frame actions are returned unchanged.
 */
export function applyFrames(
  action: AnyBrowserAction,
  frames: LocatorOptions[] | undefined
): AnyBrowserAction {
  if (frames === undefined || !('locator' in action)) {
    return action
  }

  return { ...action, frames }
}

export function createContextMenuState(
  event: PlayerMouseEvent
): ContextMenuState {
  const target = findInteractiveElement(event.target) ?? event.target

  const aria = getAriaDetails(target)
  const selectors = generateSelectors(target, aria)

  const locator = toLocatorOptions(selectors)
  const frames = buildFrameChainFromElement(target)

  return {
    type: 'context-menu',
    key: crypto.randomUUID(),
    target,
    position: {
      x: event.x,
      y: event.y,
    },
    aria,
    locator,
    frames,
  }
}
