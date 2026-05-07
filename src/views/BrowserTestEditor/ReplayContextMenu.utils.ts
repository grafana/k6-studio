import {
  getAltTextLocator,
  getCssLocator,
  getLabelLocator,
  getPlaceholderLocator,
  getRoleLocator,
  getTestIdLocator,
  getTitleLocator,
} from '@/codegen/browser/selectors'
import { PlayerMouseEvent } from '@/components/SessionPlayer/SessionPlayer.hooks'
import { ElementSelector } from '@/schemas/recording'
import { getAriaDetails } from '@/utils/dom/aria'
import { findInteractiveElement } from '@/utils/dom/dom'
import { generateSelectors } from '@/utils/dom/selectors'

import { ContextMenuState, LocatorOptions } from './types'

export function buildLocatorOptions(
  selectors: ElementSelector
): LocatorOptions {
  const values: LocatorOptions['values'] = {
    role: getRoleLocator(selectors) ?? undefined,
    css: getCssLocator(selectors) ?? undefined,
    alt: getAltTextLocator(selectors) ?? undefined,
    label: getLabelLocator(selectors) ?? undefined,
    placeholder: getPlaceholderLocator(selectors) ?? undefined,
    title: getTitleLocator(selectors) ?? undefined,
    testid: getTestIdLocator(selectors) ?? undefined,
  }

  return {
    values,
    current:
      values.role?.type ??
      values.label?.type ??
      values.alt?.type ??
      values.placeholder?.type ??
      values.title?.type ??
      values.testid?.type ??
      'css',
  }
}

export function isTextInput(element: Element, roles: string[]): boolean {
  const { HTMLInputElement, HTMLTextAreaElement } =
    element.ownerDocument?.defaultView ?? window

  if (element instanceof HTMLTextAreaElement) {
    return true
  }

  if (element instanceof HTMLInputElement) {
    const type = element.type.toLowerCase()

    return [
      'text',
      'email',
      'password',
      'search',
      'url',
      'tel',
      'number',
      '',
    ].includes(type)
  }

  return roles.includes('textbox') || roles.includes('searchbox')
}

export function isCheckbox(element: Element, roles: string[]): boolean {
  const { HTMLInputElement } = element.ownerDocument?.defaultView ?? window

  if (element instanceof HTMLInputElement && element.type === 'checkbox') {
    return true
  }

  return roles.includes('checkbox') || roles.includes('switch')
}

export function isRadio(element: Element, roles: string[]): boolean {
  const { HTMLInputElement } = element.ownerDocument?.defaultView ?? window

  if (element instanceof HTMLInputElement && element.type === 'radio') {
    return true
  }

  return roles.includes('radio')
}

export function isSelect(element: Element, roles: string[]): boolean {
  const { HTMLSelectElement } = element.ownerDocument?.defaultView ?? window

  if (element instanceof HTMLSelectElement) {
    return true
  }

  return roles.includes('combobox') || roles.includes('listbox')
}

export function createContextMenuState(
  event: PlayerMouseEvent
): ContextMenuState {
  const target = findInteractiveElement(event.target) ?? event.target

  const aria = getAriaDetails(target)
  const selectors = generateSelectors(target, aria)

  const locator = buildLocatorOptions(selectors)

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
  }
}
