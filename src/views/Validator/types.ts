import { eventWithTime } from '@rrweb/types'

import { BrowserActionEvent } from '@/main/runner/schema'
import { Check, LogEntry } from '@/schemas/k6'
import { ProxyData } from '@/types'

export type DebuggerState = 'pending' | 'running' | 'stopped'

export interface DebugSession {
  id: string
  state: DebuggerState
  requests: ProxyData[]
  browser: {
    actions: BrowserActionEvent[]
    replay: eventWithTime[]
  }
  logs: LogEntry[]
  checks: Check[]
}
