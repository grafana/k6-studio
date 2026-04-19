/**
 * Minimal stub for `electron-log/renderer` when running the UI in a plain browser.
 */
const log = {
  error: (...args: unknown[]) => {
    console.error(...args)
  },
  warn: (...args: unknown[]) => {
    console.warn(...args)
  },
  info: (...args: unknown[]) => {
    console.info(...args)
  },
  debug: (...args: unknown[]) => {
    console.debug(...args)
  },
  errorHandler: {
    startCatching: () => {},
  },
}

export default log
