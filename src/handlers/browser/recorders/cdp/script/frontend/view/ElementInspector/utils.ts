import { nanoid } from 'nanoid'

import { getEventTarget } from '@/handlers/browser/recorders/cdp/script/target'
import {
  ElementRole,
  getElementRoles,
} from '@/handlers/browser/recorders/cdp/script/utils/aria'
import { BrowserEventTarget } from '@/schemas/recording'

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
