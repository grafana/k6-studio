import { nanoid } from 'nanoid'

import { Bounds } from '@/components/Browser/types'
import { getElementBounds } from '@/components/Browser/utils'
import { getEventTarget } from '@/recorder/browser/target'
import { ElementRole, getElementRoles } from '@/recorder/browser/utils/aria'
import { BrowserEventTarget } from '@/schemas/recording'

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
