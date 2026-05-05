import { LogEntry } from '@/schemas/k6'

import { LogEntryWithSource } from './types'

export function formatTime(time: string) {
  const date = new Date(time)

  return date.toLocaleTimeString(navigator.language, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

/**
 * LogEntry has a source property but it's not really reliable and doesn't let us
 * distinguish between logs from the browser module and logs from the actual browser,
 * so we use our own source mappings.
 */
export function getSource(entry: LogEntry) {
  if (entry.process === 'browser') {
    return 'browser'
  }

  // Console is ambiguous in this context because it could be referring to the console
  // API in k6 or in the browser. To avoid confusion we re-map it to "script".
  if (entry.source === 'console') {
    return 'script'
  }

  return 'runtime'
}

export function withSource(entry: LogEntry): LogEntryWithSource {
  return {
    source: getSource(entry),
    entry,
  }
}
