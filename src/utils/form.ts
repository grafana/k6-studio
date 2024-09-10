export function stringAsNullableNumber(value: string) {
  return value ? parseFloat(value) : null
}

export function stringAsOptionalNumber(value: string) {
  return value ? parseFloat(value) : undefined
}
