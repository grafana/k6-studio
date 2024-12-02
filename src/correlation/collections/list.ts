interface Cons<T> {
  type: 'cons'
  head: T
  tail: List<T>
}

export type List<T> = Cons<T> | typeof empty

export const empty: unique symbol = Symbol('empty list')

export const push = <T>(list: List<T>, item: T): List<T> => ({
  type: 'cons',
  head: item,
  tail: list,
})
