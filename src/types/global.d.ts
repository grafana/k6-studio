declare global {
  export type EmptyObject = Record<string, never>

  export type Falsy<T> = T | false | 0 | '' | null | undefined
}

export {}
