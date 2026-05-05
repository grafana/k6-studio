import { Bounds } from '@/components/Browser/types'

import { TrackedElement } from './ElementInspector/utils'

export interface TextSelection {
  text: string
  element: TrackedElement
  range: Range
  bounds: Bounds
  highlights: Bounds[]
}
