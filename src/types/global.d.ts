declare global {
  export type EmptyObject = Record<string, never>

  export type Falsy<T> = T | false | 0 | '' | null | undefined
}

// Extend the k6 browser module with the $trace method on Page and Locator. This method
// is added by the browser shim in order to track the status of actions in the browser test
// editor. It is not a part of the actual k6 browser API.
declare module 'k6/browser' {
  interface Page {
    $trace(name: string): Page
  }

  interface Locator {
    $trace(name: string): Locator
  }
}

export {}
