import { finder } from '@medv/finder'
import { computeAccessibleName } from 'dom-accessibility-api'

import { ActionLocator } from '@/main/runner/schema'
import { getElementRoles } from '@/recorder/browser/utils/aria'

import { LocatorOptions } from './types'

const INTERACTIVE_ROLES = new Set([
  'button',
  'link',
  'textbox',
  'searchbox',
  'checkbox',
  'radio',
  'combobox',
  'listbox',
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'option',
  'tab',
  'switch',
])

export function getInteractiveTarget(element: HTMLElement): HTMLElement {
  let current: Element | null = element

  while (current !== null) {
    if (
      current instanceof HTMLInputElement ||
      current instanceof HTMLButtonElement ||
      current instanceof HTMLSelectElement ||
      current instanceof HTMLTextAreaElement ||
      current instanceof HTMLAnchorElement
    ) {
      return current
    }

    const role = current.getAttribute('role')

    if (role !== null && INTERACTIVE_ROLES.has(role)) {
      return current as HTMLElement
    }

    current = current.parentElement
  }

  return element
}

export function buildLocatorOptions(element: HTMLElement): LocatorOptions {
  const roles = [...getElementRoles(element)]
    .filter((r) => r.role !== 'generic')
    .map((r) => r.role)

  const accessibleName = computeAccessibleName(element).trim()

  let cssSelector: string

  try {
    cssSelector = finder(element, { root: element.ownerDocument.body })
  } catch {
    cssSelector = element.tagName.toLowerCase()
  }

  const values: LocatorOptions['values'] = {
    css: { type: 'css', selector: cssSelector },
  }

  let current: ActionLocator['type'] = 'css'

  if (roles.length > 0 && accessibleName) {
    const role = roles[0]!

    values.role = {
      type: 'role',
      role,
      options: { name: accessibleName, exact: false },
    }

    current = 'role'
  }

  return { current, values }
}

export function isTextInput(element: HTMLElement, roles: string[]): boolean {
  if (element instanceof HTMLTextAreaElement) return true

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

export function isCheckbox(element: HTMLElement, roles: string[]): boolean {
  if (element instanceof HTMLInputElement && element.type === 'checkbox')
    return true
  return roles.includes('checkbox') || roles.includes('switch')
}

export function isRadio(element: HTMLElement, roles: string[]): boolean {
  if (element instanceof HTMLInputElement && element.type === 'radio')
    return true
  return roles.includes('radio')
}

export function isSelect(element: HTMLElement, roles: string[]): boolean {
  if (element instanceof HTMLSelectElement) return true
  return roles.includes('combobox') || roles.includes('listbox')
}
