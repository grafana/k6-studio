import { Bounds } from '@/components/Browser/types'

import { LiveTrackedElement } from './ElementInspector/utils'

export interface TextSelection {
  text: string
  element: LiveTrackedElement
  range: Range
  bounds: Bounds
  highlights: Bounds[]
}
