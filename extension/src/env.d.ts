/**
 * Flag to determine if the extension has been built as part of k6 Studio
 * or if it's built as a standalone extension. This is used to e.g. determine
 * if we should open a websocket connection to k6 Studio.
 */
declare const STANDALONE_EXTENSION: boolean

declare global {
  interface Window {
    __K6_STUDIO_TAB_ID__: string | undefined
  }
}

export {}
