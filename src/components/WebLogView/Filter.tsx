import { Cross2Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { IconButton, TextField } from '@radix-ui/themes'
import { RootProps } from '@radix-ui/themes/dist/cjs/components/text-field'
import { useState } from 'react'
import { useDebounce, useKeyPressEvent } from 'react-use'

export function Filter({
  filter,
  setFilter,
  ...inputProps
}: RootProps & {
  filter: string
  setFilter: (filter: string) => void
}) {
  const [value, setValue] = useState(filter)
  // const debouncedSetFilter = debounce(setFilter, 300)
  useDebounce(() => setFilter(value), 200, [value])

  const clearFilter = () => {
    setValue('')
    setFilter('')
  }

  useKeyPressEvent('Escape', clearFilter)
  console.log('value: ', value)

  return (
    <TextField.Root
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Filter requests"
      size="1"
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
