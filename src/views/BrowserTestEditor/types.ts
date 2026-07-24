import { BrowserDebuggerEvent } from '@/main/runner/schema'
import { LocatorOptions, TargetLocatorOptions } from '@/schemas/locator'
import { AriaDetails } from '@/schemas/recording'

export interface ContextMenuState {
  type: 'context-menu'
  key: string
  target: Element
  position: {
    x: number
    y: number
  }
  aria: AriaDetails
  locator: TargetLocatorOptions
  // Chain of iframe locators (outermost first) the clicked element lives in.
  frames?: LocatorOptions[]
}

export type BrowserActionStates = Partial<
  Record<string, BrowserDebuggerEvent[]>
>
