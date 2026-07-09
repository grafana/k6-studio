import { BrowserEvent, BrowserEventTarget } from '@/schemas/recording'

import { withFrames } from './frames'

/**
 * Emits recorded events in capture order even though frame paths resolve
 * asynchronously: each emission awaits the previous one. A failed path lookup
 * falls back to no frame path so a single slow or broken ancestor can't stall
 * the recording. If send() throws, the error is logged and the next emission
 * continues normally, preventing the chain from being poisoned.
 *
 * Returns `flush` alongside `emit` so callers can synchronously send every
 * still-unsent batch at document teardown (e.g. on pagehide), before the async
 * frame-path lookup would otherwise resolve. Flushed batches go out frameless,
 * and are marked sent so the pending async chain doesn't send them again once
 * its path lookup later resolves.
 */
export function createSequentialEmitter(
  getPath: () => Promise<BrowserEventTarget[]>,
  send: (events: BrowserEvent[]) => void
) {
  let pending: Promise<void> = Promise.resolve()
  const unsentBatches = new Set<BrowserEvent[]>()

  function sendBatch(batch: BrowserEvent[]) {
    try {
      send(batch)
    } catch (error) {
      console.error('Failed to send events:', error)
    }
  }

  function emit(events: BrowserEvent[] | BrowserEvent) {
    const list = Array.isArray(events) ? events : [events]

    unsentBatches.add(list)

    pending = pending.then(async () => {
      const frames = await getPath().catch(() => [])

      // The batch may have already been flushed synchronously while this
      // lookup was in flight; don't send it a second time.
      if (!unsentBatches.delete(list)) {
        return
      }

      sendBatch(list.map((event) => withFrames(event, frames)))
    })
  }

  function flush() {
    const batches = [...unsentBatches]

    unsentBatches.clear()

    batches.forEach((batch) => {
      sendBatch(batch.map((event) => withFrames(event, [])))
    })
  }

  return { emit, flush }
}
