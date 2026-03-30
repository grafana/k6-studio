import { FieldErrors } from 'react-hook-form'

export function toFieldErrors(
  name: string,
  message?: string
): FieldErrors | undefined {
  if (!message) return undefined
  return { [name]: { message } } as FieldErrors
}
