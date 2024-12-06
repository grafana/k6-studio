export function safeJsonParse<T extends object>(value: string) {
  try {
    return JSON.parse(value) as T
  } catch (error) {
    console.error('Failed to parse JSON', error)
    return undefined
  }
}

export function formatJsonPath([first, ...rest]: Array<string | number>) {
  return rest.reduce<string>((acc, part) => {
    if (typeof part === 'string') {
      return `${acc}.${part}`
    }

    return `${acc}[${part}]`
  }, String(first))
}
