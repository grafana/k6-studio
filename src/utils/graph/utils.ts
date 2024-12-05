export function* pairwise<T>(arr: T[]): IterableIterator<[T, T]> {
  for (let i = 0; i < arr.length - 1; i++) {
    const first = arr[i]
    const second = arr[i + 1]

    if (first === undefined || second === undefined) {
      return
    }

    yield [first, second]
  }
}
