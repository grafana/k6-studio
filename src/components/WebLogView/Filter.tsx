import { Cross2Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { IconButton, TextField } from '@radix-ui/themes'
import { RootProps } from '@radix-ui/themes/dist/cjs/components/text-field'
import { useEffect, useRef, useState } from 'react'
import { useDebounce, useKeyPressEvent } from 'react-use'
import useKeyboardJs from 'react-use/lib/useKeyboardJs'

export function Filter({
  filter,
  setFilter,
  ...inputProps
}: RootProps & {
  filter: string
  setFilter: (filter: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState(filter)
  useDebounce(() => setFilter(value), 300, [value])

  const clearFilter = () => {
    setValue('')
    setFilter('')
  }

  useKeyPressEvent('Escape', clearFilter)

  // Focus input on cmd+f/ctrl+f
  const [, keyPressEvent] = useKeyboardJs(['command + f', 'ctrl + f'])

  useEffect(() => {
    if (keyPressEvent) {
      inputRef.current?.focus()
    }
  }, [keyPressEvent])

  return (
    <TextField.Root
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Filter requests"
      size="1"
      ref={inputRef}
      {...inputProps}
    >
      <TextField.Slot>
        <MagnifyingGlassIcon />
      </TextField.Slot>
      {value !== '' && (
        <TextField.Slot>
          <IconButton variant="ghost" size="1" onClick={clearFilter}>
            <Cross2Icon />
          </IconButton>
        </TextField.Slot>
      )}
    </TextField.Root>
  )
}
