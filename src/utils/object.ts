export function typedEntries<K extends string, V>(
  record: Record<K, V>
): Array<[K, V]> {
  return Object.entries(record) as Array<[K, V]>
}

export function stripUndefined(value: unknown): unknown {
  if (value === null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(stripUndefined)
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .map(([key, v]) => [key, stripUndefined(v)])
  )
}
