import { StateCreator } from 'zustand'

/**
 * Used to give a type error when not every possibility has been checked in e.g. a switch-statement.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function exhaustive<T, R = never>(value: never, defaultValue?: R): R {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return defaultValue ?? (value as any as R)
}

export type ImmerStateCreator<T> = StateCreator<
  T,
  [['zustand/immer', never], never],
  [],
  T
>

export function isNodeJsErrnoException(
  error: unknown
): error is NodeJS.ErrnoException {
  return (
    error instanceof Error &&
    'code' in error &&
    'errno' in error &&
    'syscall' in error
  )
}
