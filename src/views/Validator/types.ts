import { BrowserActionEvent } from '@/main/runner/schema'
import { Check, LogEntry } from '@/schemas/k6'
import { ProxyData } from '@/types'

export interface DebugSession {
  running: boolean
  requests: ProxyData[]
  browserActions: BrowserActionEvent[]
  logs: LogEntry[]
  checks: Check[]
}
