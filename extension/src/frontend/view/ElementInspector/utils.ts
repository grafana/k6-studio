import { ElementSelector } from '@/schemas/recording'
import { uuid } from '@/utils/uuid'
import { ElementRole, getElementRoles } from 'extension/src/utils/aria'

import { generateSelectors } from '../../../selectors'
import { Bounds } from '../types'
import { getElementBounds } from '../utils'

export interface TrackedElement {
  id: string
  roles: ElementRole[]
  selector: ElementSelector
  target: Element
  bounds: Bounds
}

export function toTrackedElement(element: Element): TrackedElement {
  const roles = getElementRoles(element)

  return {
    id: uuid(),
    roles: [...roles],
    selector: generateSelectors(element),
    target: element,
    bounds: getElementBounds(element),
  }
}
