export function safeJsonParse(value: string) {
  try {
    return JSON.parse(value)
  } catch (error) {
    console.error('Failed to parse JSON', error)
    return undefined
  }
}
