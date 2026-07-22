import { nanoid } from 'nanoid'

import { Bounds } from '@/components/Browser/types'
import { BrowserEventTarget } from '@/schemas/recording'
import { ElementRole, getElementRoles } from '@/utils/dom/aria'
import { getElementDetails } from '@/utils/dom/selectors'

import { getElementBoundsInTopFrame } from '../frameGeometry'

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
    target: getElementDetails(element),
    element: element,
    bounds: getElementBoundsInTopFrame(element),
  }
}
