import { BrowserEventTarget } from '@/schemas/recording'
import { uuid } from '@/utils/uuid'
import { ElementRole, getElementRoles } from 'extension/src/utils/aria'

import { getEventTarget } from '../../target'
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
    id: uuid(),
    roles: [...roles],
    target: getEventTarget(element),
    element: element,
    bounds: getElementBounds(element),
  }
}
