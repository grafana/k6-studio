import { BrowserActionEvent, BrowserReplayEvent } from '@/main/runner/schema'
import { Check, LogEntry } from '@/schemas/k6'
import { ProxyData } from '@/types'

export type DebuggerState = 'pending' | 'running' | 'stopped'

export interface DebugSession {
  id: string
  state: DebuggerState
  requests: ProxyData[]
  browser: {
    actions: BrowserActionEvent[]
    replay: BrowserReplayEvent[]
  }
  logs: LogEntry[]
  checks: Check[]
}
