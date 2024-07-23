export function stringifyObject(obj: object): string {
  const properties = Object.entries(obj)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}: ${stringifyValue(value)}`)
    .join(',\n')

  return `{${properties}}`
}

export function stringifyArray(arr: unknown[]): string {
  return `[${arr.map(stringifyValue).join(', ')}]`
}

export function stringifyValue(value: unknown): string {
  if (typeof value === 'string') {
    return `'${value}'`
  }

  if (Array.isArray(value)) {
    return stringifyArray(value)
  }

  if (typeof value === 'object' && value !== null) {
    return stringifyObject(value)
  }

  return `${value}`
}
