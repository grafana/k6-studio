import { LogEntry } from '@/schemas/k6'

export type LogSource = 'browser' | 'runtime' | 'script'

export interface ConsoleFilter {
  levels: Array<LogEntry['level']>
  sources: Array<LogSource>
}

export interface LogEntryWithSource {
  source: LogSource
  entry: LogEntry
}
