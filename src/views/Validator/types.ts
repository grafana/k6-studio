import { Check, LogEntry } from '@/schemas/k6'
import { ProxyData } from '@/types'

export interface DebugSession {
  requests: ProxyData[]
  logs: LogEntry[]
  checks: Check[]
}
