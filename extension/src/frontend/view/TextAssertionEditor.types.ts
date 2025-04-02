import { Bounds } from './types'

export interface TextSelection {
  text: string
  selector: string
  range: Range
  bounds: Bounds
  highlights: Bounds[]
}
