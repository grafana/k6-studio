import { Workspace } from '@/utils/workspace'

declare global {
  export type EmptyObject = Record<string, never>

  export type Falsy<T> = T | false | 0 | '' | null | undefined

  namespace Electron {
    interface BrowserWindow {
      workspace: Workspace
    }
  }
}

export {}
