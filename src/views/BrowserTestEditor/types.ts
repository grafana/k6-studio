import { ActionLocator, AnyBrowserAction } from '@/main/runner/schema'

interface LocatorOptions {
  current: ActionLocator['type']
  values: ActionLocator[]
}

export type WithEditorMetadata<T> = (T extends { locator: ActionLocator }
  ? Omit<T, 'locator'> & { locator: LocatorOptions }
  : T) & { id: string }

export type BrowserActionInstance = WithEditorMetadata<AnyBrowserAction>
