export const tryDecodeBase64 = (str: unknown): string | undefined => {
  try {
    if (typeof str !== 'string') {
      return undefined
    }

    return atob(str)
  } catch {
    return undefined
  }
}

export const isBase64 = (str: string) => tryDecodeBase64(str) !== undefined
