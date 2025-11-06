import { nanoid } from 'nanoid'

import { BrowserEventTarget } from '@/schemas/recording'
import { getEventTarget } from 'extension/src/target'
import { ElementRole, getElementRoles } from 'extension/src/utils/aria'

import { Bounds } from '../types'
import { getElementBounds } from '../utils'

export interface TrackedElement {
  id: string
  roles: ElementRole[]
  target: BrowserEventTarget
  element: Element
  bounds: Bounds
}

export function toTrackedElement(element: Element): TrackedElement {
  const roles = getElementRoles(element)

  return {
    id: nanoid(),
    roles: [...roles],
    target: getEventTarget(element),
    element: element,
    bounds: getElementBounds(element),
  }
}
