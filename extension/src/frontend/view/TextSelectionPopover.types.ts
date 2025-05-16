import { ElementSelector } from '@/schemas/recording'

import { Bounds } from './types'

export interface TextSelection {
  text: string
  selector: ElementSelector
  range: Range
  bounds: Bounds
  highlights: Bounds[]
}
