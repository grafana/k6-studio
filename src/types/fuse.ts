export interface SearchMatch {
  indices: Readonly<Array<[number, number]>>
  value?: string
  key?: string
}
