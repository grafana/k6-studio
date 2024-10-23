import { RootProps } from '@radix-ui/themes/dist/cjs/components/text-field'
import { useEffect, useRef } from 'react'
import { useKeyPressEvent } from 'react-use'
import useKeyboardJs from 'react-use/lib/useKeyboardJs'
import { SearchField, SearchFieldHandle } from '../SearchField'

export function Filter({
  filter,
  setFilter,
  ...inputProps
}: RootProps & {
  filter: string
  setFilter: (filter: string) => void
}) {
  const inputRef = useRef<SearchFieldHandle>(null)

  useKeyPressEvent('Escape', () => {
    inputRef.current?.clear()
  })

  // Focus input on cmd+f/ctrl+f
  const [, keyPressEvent] = useKeyboardJs(['command + f', 'ctrl + f'])

  useEffect(() => {
    if (keyPressEvent) {
      inputRef.current?.focus()
    }
  }, [keyPressEvent])

  return (
    <SearchField
      {...inputProps}
      ref={inputRef}
      filter={filter}
      placeholder="Filter by URL, method, or status code"
      size="1"
      onChange={setFilter}
    />
  )
}
