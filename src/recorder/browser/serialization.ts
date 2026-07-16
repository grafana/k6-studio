import { z } from 'zod/v4'

import {
  getCheckedState,
  getTextBoxValue,
} from '@/recorder/browser/view/ElementInspector/ElementMenu.utils'
import { BrowserEventTargetSchema } from '@/schemas/recording'
import { ElementRole, getElementRoles } from '@/utils/dom/aria'
import { findAssociatedElement } from '@/utils/dom/dom'
import { isHTMLInputElement } from '@/utils/dom/realm'
import { getElementDetails } from '@/utils/dom/selectors'

export const ElementRoleSchema = z.object({
  type: z.enum(['intrinsic', 'explicit']),
  role: z.string(),
}) satisfies z.ZodType<ElementRole>

export const BoundsSchema = z.object({
  top: z.number(),
  left: z.number(),
  width: z.number(),
  height: z.number(),
})

export const SerializedElementStateSchema = z.object({
  target: BrowserEventTargetSchema,
  roles: z.array(ElementRoleSchema),
  bounds: BoundsSchema,
  checkedState: z.enum(['checked', 'unchecked', 'indeterminate']),
  textBoxValue: z.string(),
  isNativeCheckbox: z.boolean(),
})

export type SerializedElementState = z.infer<
  typeof SerializedElementStateSchema
>

/**
 * Snapshots everything the cross-origin inspector needs to describe `element`
 * without keeping a live reference to it, so the state can be relayed across
 * frame boundaries as plain, serializable data.
 *
 * A label wrapping a checkbox/radio/textbox has no checked state or value of
 * its own, so `checkedState`, `textBoxValue`, and `isNativeCheckbox` are read
 * from the associated control when `element` is a label, falling back to
 * `element` itself otherwise. `target` and `roles` always describe `element`
 * as inspected, since that is what the user pointed at.
 */
export function serializeElementState(
  element: Element
): SerializedElementState {
  const controlElement = findAssociatedElement(element) ?? element
  const bounds = element.getBoundingClientRect()

  return {
    target: getElementDetails(element),
    roles: [...getElementRoles(element)],
    bounds: {
      top: bounds.top,
      left: bounds.left,
      width: bounds.width,
      height: bounds.height,
    },
    checkedState: getCheckedState(controlElement),
    textBoxValue: getTextBoxValue(controlElement),
    isNativeCheckbox:
      isHTMLInputElement(controlElement) && controlElement.type === 'checkbox',
  }
}

/**
 * Serializes `element` and its ancestor chain, innermost first, stopping
 * before `documentElement` so `<body>` is included but `<html>` is not.
 */
export function serializeElementChain(
  element: Element
): SerializedElementState[] {
  const documentElement = element.ownerDocument.documentElement
  const chain: Element[] = []

  let current: Element | null = element

  while (current !== null && current !== documentElement) {
    chain.push(current)
    current = current.parentElement
  }

  return chain.map(serializeElementState)
}
