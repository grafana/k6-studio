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
