// TODO: find a well-maintained library for this
export function stringify(value: unknown): string {
  if (typeof value === 'string') {
    return `'${value}'`
  }

  if (Array.isArray(value)) {
    return `[${value.map(stringify).join(', ')}]`
  }

  if (typeof value === 'object' && value !== null) {
    const properties = Object.entries(value)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${key}: ${stringify(value)}`)
      .join(',\n')

    return `{${properties}}`
  }

  return `${value}`
}
