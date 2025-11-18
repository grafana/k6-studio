import { LogEntry } from '@/schemas/k6'

export function createK6Log(log?: Partial<LogEntry>): LogEntry {
  return {
    error: '',
    msg: 'Log',
    level: 'info',
    source: 'source',
    time: '00:00:00',
    ...log,
  }
}
