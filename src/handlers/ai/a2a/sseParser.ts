import type { A2ASSEEvent, ActiveA2ASession } from './types'

/**
 * Extracts complete SSE events from the session's buffer.
 * Incomplete events (no trailing blank line) remain in the buffer for the next read.
 */
export function extractSSEEvents(session: ActiveA2ASession): A2ASSEEvent[] {
  const events: A2ASSEEvent[] = []
  const lines = session.sseBuffer.split('\n')
  let dataLines: string[] = []
  let lastCompleteIndex = -1

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''

    if (line.trim() === '') {
      if (dataLines.length > 0) {
        try {
          const parsed = JSON.parse(dataLines.join('\n')) as A2ASSEEvent
          events.push(parsed)
        } catch {
          // Skip malformed events
        }
      }
      dataLines = []
      lastCompleteIndex = i
      continue
    }

    if (line.startsWith('data: ')) {
      dataLines.push(line.slice(6))
    }
  }

  session.sseBuffer =
    lastCompleteIndex >= 0
      ? lines.slice(lastCompleteIndex + 1).join('\n')
      : session.sseBuffer

  return events
}
