export class CountedSet<T> {
  #map = new Map<T, number>()

  constructor(initial?: [T, number][]) {
    if (initial) {
      for (const [value, count] of initial) {
        if (count <= 0) {
          continue
        }

        this.#map.set(value, count)
      }
    }
  }

  add(value: T, count = 1) {
    if (count <= 0) {
      return
    }

    const currentCount = this.#map.get(value) ?? 0

    this.#map.set(value, currentCount + count)
  }

  delete(value: T) {
    const count = this.#map.get(value)

    if (count === undefined) {
      return false
    }

    if (count === 1) {
      this.#map.delete(value)
    } else {
      this.#map.set(value, count - 1)
    }

    return true
  }

  get size() {
    return this.#map.size
  }

  merge(other: Iterable<[T, number]>) {
    for (const [value, count] of other) {
      this.add(value, count)
    }
  }

  [Symbol.iterator]() {
    return this.#map.entries()
  }
}
