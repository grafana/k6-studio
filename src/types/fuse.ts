export interface SearchMatch {
  indices: Array<[number, number]>
  value?: string
  key?: string
  // TODO: import radix color type
  color?: string
}
