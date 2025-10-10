import type { Har } from 'har-format'

import { BrowserEvent } from './browser'

declare module 'har-format' {
  interface Log {
    _browserEvents?: {
      version: '2'
      events: BrowserEvent[]
    }
  }
}

export type Recording = Har
