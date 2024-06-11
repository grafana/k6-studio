/**
 * Used to give a type error when not every possibility has been checked in e.g. a switch-statement.
 */
export function exhaustive<T, R = never>(value: never, defaultValue?: R): R {
  return defaultValue ?? (value as any as R)
}
