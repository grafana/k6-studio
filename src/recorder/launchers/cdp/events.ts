import { BrowserEvent } from '@/schemas/recording'

/**
 * Appends newly recorded events to the buffer and returns it ordered by
 * timestamp. Each frame records over its own WebSocket connection, so events
 * from different frames can arrive out of order (e.g. an iframe socket that
 * connects late flushes its buffer in a burst). Keeping the buffer sorted
 * preserves the order in which the user actually interacted, which is what
 * codegen turns into test steps. The sort is stable, so events sharing a
 * timestamp keep their arrival order.
 */
export function mergeRecordedEvents(
  existing: BrowserEvent[],
  incoming: BrowserEvent[]
): BrowserEvent[] {
  return [...existing, ...incoming].sort((a, b) => a.timestamp - b.timestamp)
}
