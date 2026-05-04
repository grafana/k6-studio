import { AnyBrowserAction } from '@/main/runner/schema'
import { ElementLocator } from '@/schemas/locator'
import { AriaDetails } from '@/schemas/recording'

export interface LocatorOptions {
  current: ElementLocator['type']
  values: {
    [Type in ElementLocator['type']]?: Extract<ElementLocator, { type: Type }>
  }
}

export type WithEditorMetadata<T> = (T extends { locator: ElementLocator }
  ? Omit<T, 'locator'> & { locator: LocatorOptions }
  : T) & { id: string }

export type BrowserActionInstance = WithEditorMetadata<AnyBrowserAction>

export interface ContextMenuState {
  type: 'context-menu'
  target: Element
  position: {
    x: number
    y: number
  }
  aria: AriaDetails
  locator: LocatorOptions
}
