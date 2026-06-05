export type NonEmptyArray<T> = [T, ...T[]]

/**
 * Normalizes an empty array to `undefined`, leaving a non-empty array
 * unchanged. Used for optional collections (e.g. an iframe frame chain) where
 * absent and empty mean the same thing.
 */
export function emptyToUndefined<T>(items: T[]): T[] | undefined {
  return items.length > 0 ? items : undefined
}

export function mapNonEmpty<T, U>(
  [first, ...rest]: NonEmptyArray<T>,
  fn: (item: T) => U
): NonEmptyArray<U> {
  return [fn(first), ...rest.map(fn)]
}
