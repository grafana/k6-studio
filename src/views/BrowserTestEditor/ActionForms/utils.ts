import { FieldErrors } from 'react-hook-form'

export function buildFieldErrors(
  name: string,
  message?: string | null
): FieldErrors | undefined {
  if (!message) {
    return undefined
  }

  return { [name]: { message } } as FieldErrors
}
