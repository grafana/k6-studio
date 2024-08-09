export function safeJsonParse<T extends object>(value: string) {
  try {
    return JSON.parse(value) as T
  } catch (error) {
    console.error('Failed to parse JSON', error)
    return undefined
  }
}
