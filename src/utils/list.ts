export type NonEmptyArray<T> = [T, ...T[]]

export function mapNonEmpty<T, U>(
  [first, ...rest]: NonEmptyArray<T>,
  fn: (item: T) => U
): NonEmptyArray<U> {
  return [fn(first), ...rest.map(fn)]
}
