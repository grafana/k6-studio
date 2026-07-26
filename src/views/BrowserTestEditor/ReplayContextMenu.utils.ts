import { PlayerMouseEvent } from '@/components/SessionPlayer/SessionPlayer.hooks'
import { BrowserEventTarget } from '@/schemas/recording/browser/v2'
import { findInteractiveElement } from '@/utils/dom/dom'
import { forEachOwningFrame } from '@/utils/dom/frameChain'
import {
  isHTMLInputElement,
  isHTMLSelectElement,
  isHTMLTextAreaElement,
} from '@/utils/dom/realm'
import { getElementDetails } from '@/utils/dom/selectors'
import { toElementLocatorOptions } from '@/utils/locator'

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
) {
  try {
    const chain: BrowserEventTarget[] = []

    forEachOwningFrame(
      element.ownerDocument.defaultView,
      // Stop at the SessionPlayer's own iframe, which lives directly in
      // appWindow's document and isn't part of the recorded page.
      (win) => win === appWindow || win.parent === appWindow,
      (iframe) => chain.push(getElementDetails(iframe))
    )

    return chain
  } catch {
    // A frame we can't walk through would yield a partial chain that resolves
    // against the wrong frame, so fall back to no frame chain.
    return []
  }
}

export function createContextMenuState(
  event: PlayerMouseEvent
): ContextMenuState {
  const target = findInteractiveElement(event.target) ?? event.target

  const details = getElementDetails(target)

  const frames = buildFrameChainFromElement(target)
  const locator = toElementLocatorOptions(details, frames)

  return {
    type: 'context-menu',
    key: crypto.randomUUID(),
    target,
    position: {
      x: event.x,
      y: event.y,
    },
    aria: details.aria,
    locator,
  }
}
