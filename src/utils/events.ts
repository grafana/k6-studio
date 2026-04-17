export type EventMap<Map> = {
  [Type in keyof Map]: unknown
}

type EventListeners<Events extends EventMap<Events>> = {
  [Type in keyof Events]?: Array<(event: Events[Type]) => void>
}

/**
 * Super-simple cross-platform event emitter.
 */
export class EventEmitter<Events extends EventMap<Events>> {
  #listeners: EventListeners<Events> = {}
  #queue: Array<() => void> | null = null

  constructor() {
    this.#listeners = {}
  }

  on<Type extends keyof Events>(
    type: Type,
    listener: (ev: Events[Type]) => void
  ) {
    if (this.#listeners[type] === undefined) {
      this.#listeners[type] = []
    }

    this.#listeners[type].push(listener)

    return () => {
      this.off(type, listener)
    }
  }

  off<Type extends keyof Events>(
    type: Type,
    listener: (ev: Events[Type]) => void
  ) {
    this.#listeners[type] = this.#listeners[type]?.filter((l) => l !== listener)
  }

  emit<Type extends keyof Events>(type: Type, event: Events[Type]) {
    // The first to emit processes the queue. Emits while processing will be
    // deferred until after all listeners of the current event have been called.
    if (this.#queue !== null) {
      this.#queue.push(this.#defer(type, event))

      return
    }

    this.#queue = [this.#defer(type, event)]

    while (this.#queue.length > 0) {
      const fn = this.#queue.shift()

      if (fn) {
        fn()
      }
    }

    this.#queue = null
  }

  #defer<Type extends keyof Events>(type: Type, event: Events[Type]) {
    return () => {
      const listeners = this.#listeners[type]

      if (listeners) {
        for (const listener of listeners) {
          try {
            listener(event)
          } catch (error) {
            console.log('Error in event listener', error)
          }
        }
      }
    }
  }
}
