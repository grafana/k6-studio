/**
 * Same as lodash's groupBy function, but it properly handles the key type when the type is a union.
 *
 * For instance:
 *
 * ```ts
 * interface Item {
 *   type: 'a' | 'b'
 * }
 *
 * const items: Item[] = []
 *
 * // Since we know `item.type` is either 'a' or 'b', we know that the result should look like:
 * // {
 * //    a?: Item[],
 * //    b?: Item[],
 * // }
 * const grouped = groupBy(items, item => item.type)
 *
 * // With lodash, this is an error because it doesn't know that `grouped.a` could exist.
 * const aItems = grouped.a
 * ```
 */
export function groupBy<K extends string | number | symbol, T>(
  arr: T[],
  fn: (abc: T) => K
): { [key in K]?: T[] } {
  const result: { [key in K]?: T[] } = {}

  for (const item of arr) {
    const key = fn(item)

    if (!result[key]) {
      result[key] = []
    }

    result[key].push(item)
  }

  return result
}
