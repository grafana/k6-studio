import { useDebouncedValue } from '@/hooks/useDebouncedValue'

export function useHighlightDebounce<T>(value: T) {
  // We add a very slight debounce to prevent the worst of the
  // flickering when moving the mouse over a page.
  return useDebouncedValue({
    value,
    delay: 30,
    maxWait: 60,
  })
}
