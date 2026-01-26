import { AnyBrowserAction } from '@/main/runner/schema'

export interface BrowserActionWithId {
  id: string
  action: AnyBrowserAction
}
