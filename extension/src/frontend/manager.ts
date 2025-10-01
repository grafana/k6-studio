import { shouldSkipEvent } from './view/utils'

type EventBlockerMap = Record<string, WeakSet<EventTarget>>
type TimeoutHandle = ReturnType<typeof setTimeout>

/**
 * Since we can't use `preventDefault`, `stopPropagation` or similar methods without
 * affecting the actual page, we need a way to block events that are side-effects of
 * other events. This manager adds logic on top of `addEventListener` that allows
 * blocking the next event of a given type on a given target.
 */
export class WindowEventManager {
  #blockedEvents: EventBlockerMap = {}

  // The browser will execute sequences of events synchronously in a single event loop
  // tick, so we can keep a history of the events that have happened before and check
  // that if we need to selectively ignore some of them.
  #reset: TimeoutHandle | null = null
  #history: Array<Event> = []

  get history(): ReadonlyArray<Event> {
    return this.#history
  }

  /**
   * Blocks the next event of the given type on the given target. This is useful to
   * avoid recording follow-up events that are triggered as a side-effect of the
   * original event.
   */
  block<T extends keyof WindowEventMap>(type: T, target: EventTarget): this {
    let blockedForType = this.#blockedEvents[type]

    if (blockedForType === undefined) {
      blockedForType = new WeakSet()

      this.#blockedEvents[type] = blockedForType
    }

    blockedForType.add(target)

    // Queue cleanup of the blocked target for the next event loop iteration. If we
    // don't do this, we might end up blocking an event we actually want to capture.
    //
    // For example, imagine a user clicking a label that is associated with a checkbox.
    // This would trigger a follow-up `click` event on the checkbox which we don't want
    // to record. However, if the recorded page calls `preventDefault` on the original
    // click event, the follow-up click on the checkbox will never happen. So the block
    // would never be removed and we would end up blocking the next legitimate click.
    setTimeout(() => {
      blockedForType.delete(target)
    }, 1)

    return this
  }

  capture<K extends keyof WindowEventMap>(
    type: K,
    listener: (ev: WindowEventMap[K], manager: WindowEventManager) => void
  ) {
    window.addEventListener(
      type,
      (ev) => {
        this.#addToHistory(ev)

        if (shouldSkipEvent(ev)) {
          return
        }

        if (this.#isBlocked(ev)) {
          return
        }

        listener(ev, this)
      },
      { capture: true }
    )
  }

  #addToHistory(ev: Event) {
    this.#history.push(ev)

    if (this.#reset === null) {
      // Clear the history on the next event loop tick, before
      // any other events can happen.
      this.#reset = setTimeout(() => {
        this.#history = []
        this.#reset = null
      }, 1)
    }
  }

  #isBlocked(ev: Event) {
    if (ev.target === null) {
      return false
    }

    const blockedForType = this.#blockedEvents[ev.type]

    if (blockedForType === undefined) {
      return false
    }

    // We only want to block the first occurence of the event for the target
    // and `delete` will return `true` if the target was present in the set
    // and therefore blocked.
    return blockedForType.delete(ev.target)
  }
}
