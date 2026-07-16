import { SerializedElementState } from '@/recorder/browser/serialization'
import { BrowserEventTarget } from '@/schemas/recording'
import { ElementRole, getElementRoles } from '@/utils/dom/aria'
import { findAssociatedElement } from '@/utils/dom/dom'
import {
  isHTMLButtonElement,
  isHTMLInputElement,
  isHTMLLabelElement,
  isHTMLSelectElement,
  isHTMLTextAreaElement,
} from '@/utils/dom/realm'
import { getElementDetails } from '@/utils/dom/selectors'

import { CheckAssertionData } from './assertions/types'
import { LiveTrackedElement, RemoteTrackedElement } from './utils'

function* getAncestors(element: Element) {
  let currentElement: Element | null = element

  while (currentElement !== null) {
    yield currentElement

    currentElement = currentElement.parentElement
  }
}

export interface LiveLabeledControl {
  kind: 'live'
  element: Element
  target: BrowserEventTarget
  roles: ElementRole[]
}

export interface RemoteLabeledControl {
  kind: 'remote'
  target: BrowserEventTarget
  roles: ElementRole[]
  checkedState: SerializedElementState['checkedState']
  textBoxValue: string
  isNativeCheckbox: boolean
  isMultilineTextBox: boolean
}

/**
 * A control the assertion menu can read from, either a live DOM element or a
 * remote element's serialized state. The role-specific menu items branch on
 * `kind` to read checked/value state through the DOM helpers below for a live
 * control, or straight from the serialized fields for a remote one.
 */
export type LabeledControl = LiveLabeledControl | RemoteLabeledControl

// Only these three fields feed the association walk. The narrowed parameter
// lets callers without a full LiveTrackedElement (e.g. cross-origin child-frame
// capture, which must not compute top-frame bounds) reuse the same logic.
export function findAssociatedControl({
  element,
  target,
  roles,
}: Pick<
  LiveTrackedElement,
  'element' | 'target' | 'roles'
>): LiveLabeledControl | null {
  // If the target is already a control, then we don't need to do a search.
  if (
    isHTMLInputElement(element) ||
    isHTMLButtonElement(element) ||
    isHTMLSelectElement(element) ||
    isHTMLTextAreaElement(element)
  ) {
    return {
      kind: 'live',
      element,
      target,
      roles,
    }
  }

  const label = [...getAncestors(element)].find((ancestor) =>
    isHTMLLabelElement(ancestor)
  )

  if (label === undefined) {
    return null
  }

  const associatedElement = findAssociatedElement(label)

  if (associatedElement === null) {
    return null
  }

  return {
    kind: 'live',
    element: associatedElement,
    target: getElementDetails(associatedElement),
    roles: [...getElementRoles(associatedElement)],
  }
}

/**
 * The remote equivalent of `findAssociatedControl`: the picked element's
 * associated control, as relayed in the `element-pick` payload. Only the
 * originally picked remote element carries it (see `RemoteTrackedElement`),
 * so this returns null once the user has expanded to an ancestor.
 */
export function getRemoteAssociatedControl(
  element: RemoteTrackedElement
): RemoteLabeledControl | null {
  const { associatedControl } = element

  if (associatedControl === null) {
    return null
  }

  return {
    kind: 'remote',
    target: associatedControl.target,
    roles: associatedControl.roles,
    checkedState: associatedControl.checkedState,
    textBoxValue: associatedControl.textBoxValue,
    isNativeCheckbox: associatedControl.isNativeCheckbox,
    isMultilineTextBox: associatedControl.isMultilineTextBox,
  }
}

export function getCheckedState(
  element: Element
): CheckAssertionData['expected'] {
  if (isHTMLInputElement(element)) {
    if (element.indeterminate) {
      return 'indeterminate'
    }

    return element.checked ? 'checked' : 'unchecked'
  }

  switch (element.getAttribute('aria-checked')) {
    case 'true':
      return 'checked'

    case 'false':
      return 'unchecked'

    case 'mixed':
      return 'indeterminate'

    default:
      return 'unchecked'
  }
}

export function getTextBoxValue(element: Element): string {
  if (isHTMLInputElement(element) || isHTMLTextAreaElement(element)) {
    return element.value
  }

  // The input must be an aria textbox, so we'll use the textContent.
  return element.textContent ?? ''
}

// The 'switch' role differs from 'checkbox' only in semantics, so if it is on a
// native checkbox we want the generated code to use `.toBeChecked()` and not
// `.toHaveAttribute()`. Shared by the live and remote variants below so the
// rule stays in one place; the remote variant is given the precomputed
// `isNativeCheckbox` flag instead of the element itself since it has no DOM
// access to check.
function isNativeGivenCheckbox(role: ElementRole, isNativeCheckbox: boolean) {
  if (role.role === 'switch' && isNativeCheckbox) {
    return true
  }

  return role.type === 'intrinsic'
}

export function isNative(role: ElementRole, element: Element) {
  return isNativeGivenCheckbox(
    role,
    isHTMLInputElement(element) && element.type === 'checkbox'
  )
}

export function isNativeRemote(role: ElementRole, isNativeCheckbox: boolean) {
  return isNativeGivenCheckbox(role, isNativeCheckbox)
}
