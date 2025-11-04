import { TrackedElement } from './ElementInspector/utils'
import { Bounds } from './types'

export interface TextSelection {
  text: string
  element: TrackedElement
  range: Range
  bounds: Bounds
  highlights: Bounds[]
}
