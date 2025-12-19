import { BrowserActionEvent } from '@/main/runner/schema'
import { Check, LogEntry } from '@/schemas/k6'
import { ProxyData } from '@/types'

export type DebuggerState = 'pending' | 'running' | 'stopped'

export interface DebugSession {
  state: DebuggerState
  requests: ProxyData[]
  browserActions: BrowserActionEvent[]
  logs: LogEntry[]
  checks: Check[]
}
