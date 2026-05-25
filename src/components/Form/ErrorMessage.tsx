import { FieldErrors, FieldValues, get } from 'react-hook-form'

import { FieldError } from './FieldError'

interface ErrorMessageProps<T extends FieldValues = FieldValues> {
  errors: FieldErrors<T> | undefined
  name: string
}

function getErrorMessage(
  errors: FieldErrors,
  name: string
): string | undefined {
  const fieldError: unknown = get(errors, name) as unknown

  if (
    typeof fieldError === 'object' &&
    fieldError !== null &&
    'message' in fieldError &&
    typeof fieldError.message === 'string'
  ) {
    return fieldError.message
  }

  return undefined
}

export function ErrorMessage({ errors, name }: ErrorMessageProps) {
  if (!errors) return null

  const message = getErrorMessage(errors, name)
  if (!message) return null

  return <FieldError>{message}</FieldError>
}
