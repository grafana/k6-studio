import { LocatorSelectOptionAction } from '@/main/runner/schema'

export function isNonEmptySelectOption(
  option: LocatorSelectOptionAction['values'][number]
) {
  if ('label' in option && option.label === '') return false
  if ('index' in option && option.index === undefined) return false

  return true
}

function selectOptionKey(
  option: LocatorSelectOptionAction['values'][number]
): string {
  if ('value' in option) return `value:${option.value}`
  if ('label' in option) return `label:${option.label}`
  return `index:${option.index}`
}

export function dedupeSelectOptions(
  options: LocatorSelectOptionAction['values']
) {
  return [
    ...new Map(
      options.map((option) => [selectOptionKey(option), option])
    ).values(),
  ]
}
