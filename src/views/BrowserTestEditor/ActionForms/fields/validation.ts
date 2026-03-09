export function required(message: string) {
  return (value: string) => (value.trim() === '' ? message : null)
}

export function validUrl(message: string) {
  return (value: string) => {
    try {
      new URL(value)
      return null
    } catch {
      return message
    }
  }
}

export function composeValidators(
  ...validators: Array<(value: string) => string | null>
) {
  return (value: string) => {
    for (const validator of validators) {
      const error = validator(value)
      if (error) {
        return error
      }
    }
    return null
  }
}
