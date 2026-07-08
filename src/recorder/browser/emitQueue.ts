import { BrowserEvent, BrowserEventTarget } from '@/schemas/recording'

import { withFrames } from './frames'

/**
 * Emits recorded events in capture order even though frame paths resolve
 * asynchronously: each emission awaits the previous one. A failed path lookup
 * falls back to no frame path so a single slow or broken ancestor can't stall
 * the recording. If send() throws, the error is logged and the next emission
 * continues normally, preventing the chain from being poisoned.
 */
export function createSequentialEmitter(
  getPath: () => Promise<BrowserEventTarget[]>,
  send: (events: BrowserEvent[]) => void
) {
  let pending: Promise<void> = Promise.resolve()

  return function emit(events: BrowserEvent[] | BrowserEvent) {
    const list = Array.isArray(events) ? events : [events]

    pending = pending.then(async () => {
      const frames = await getPath().catch(() => [])

      try {
        send(list.map((event) => withFrames(event, frames)))
      } catch (error) {
        console.error('Failed to send events:', error)
      }
    })
  }
}
