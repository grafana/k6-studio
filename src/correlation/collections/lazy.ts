export function* concat<A>(left: Iterable<A>, right: Iterable<A>) {
  yield* left
  yield* right
}

export function* filter<A>(items: Iterable<A>, fn: (a: A) => boolean) {
  for (const item of items) {
    if (fn(item)) {
      yield item
    }
  }
}

export function* map<A, B>(items: Iterable<A>, fn: (a: A) => B) {
  for (const item of items) {
    yield fn(item)
  }
}

export function* flatMap<A, B>(items: Iterable<A>, fn: (a: A) => Iterable<B>) {
  for (const item of items) {
    for (const inner of fn(item)) {
      yield inner
    }
  }
}

export function* flatMapUndefined<A, B>(
  items: Iterable<A>,
  fn: (a: A) => B | undefined
): Iterable<B> {
  for (const item of items) {
    const inner = fn(item)

    if (inner !== undefined) {
      yield inner
    }
  }
}

export const reduce = <TItem, TAcc>(
  items: Iterable<TItem>,
  acc: TAcc,
  fn: (acc: TAcc, item: TItem, index: number) => TAcc
) => {
  let current = acc
  let index = 0

  for (const item of items) {
    current = fn(current, item, index)
    index += 1
  }

  return current
}
