import { nanoid } from 'nanoid'

import { Bounds } from '@/components/Browser/types'
import { getElementBounds } from '@/components/Browser/utils'
import { BrowserEventTarget } from '@/schemas/recording'
import { getEventTarget } from 'extension/src/target'
import { ElementRole, getElementRoles } from 'extension/src/utils/aria'

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
