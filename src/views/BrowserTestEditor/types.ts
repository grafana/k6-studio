import { BrowserDebuggerEvent } from '@/main/runner/schema'
import { AnyBrowserAction } from '@/schemas/browserTest'
import { ElementLocator } from '@/schemas/locator'

export interface LocatorOptions {
  current: ElementLocator['type']
  values: Partial<Record<ElementLocator['type'], ElementLocator>>
}

export type WithEditorMetadata<T> = (T extends { locator: ElementLocator }
  ? Omit<T, 'locator'> & { locator: LocatorOptions }
  : T) & { id: string }

export type BrowserActionInstance = WithEditorMetadata<AnyBrowserAction>

export type BrowserActionStates = Partial<
  Record<string, BrowserDebuggerEvent[]>
>
