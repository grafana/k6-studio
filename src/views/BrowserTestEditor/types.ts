import { BrowserDebuggerEvent } from '@/main/runner/schema'
import { TargetLocatorOptions } from '@/schemas/locator'
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
}

export type BrowserActionStates = Partial<
  Record<string, BrowserDebuggerEvent[]>
>
