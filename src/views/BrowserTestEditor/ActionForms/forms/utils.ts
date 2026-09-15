import { FieldErrors } from 'react-hook-form'

export function toFieldErrors(
  name: string,
  message: string | false | undefined
): FieldErrors | undefined {
  if (!message) {
    return undefined
  }

  return { [name]: { message } } as FieldErrors
}
