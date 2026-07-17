import { Bounds } from '@/components/Browser/types'
import { BrowserEventTarget } from '@/schemas/recording'

import {
  LiveTrackedElement,
  RemoteTrackedElement,
} from './ElementInspector/utils'

interface TextSelectionBase {
  text: string
  bounds: Bounds
  highlights: Bounds[]
}

export interface LiveTextSelection extends TextSelectionBase {
  kind: 'live'
  element: LiveTrackedElement
  range: Range
}

export interface RemoteTextSelection extends TextSelectionBase {
  kind: 'remote'
  element: RemoteTrackedElement
  /** The selection's own frame chain, as resolved when it was relayed up. */
  framePath: BrowserEventTarget[] | null
}

export type TextSelection = LiveTextSelection | RemoteTextSelection
