import type { Har } from 'har-format'

import { BrowserEvent } from './browser'

declare module 'har-format' {
  interface Log {
    _browserEvents?: BrowserEvent[]
  }
}

export type Recording = Har
