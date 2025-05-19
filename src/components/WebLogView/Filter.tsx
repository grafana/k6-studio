import { IconButton, TextField, Tooltip } from '@radix-ui/themes'
import { RootProps } from '@radix-ui/themes/dist/cjs/components/text-field'
import { CodeXmlIcon } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useKeyPressEvent } from 'react-use'
import useKeyboardJs from 'react-use/lib/useKeyboardJs'

import { SearchField, SearchFieldHandle } from '../SearchField'

export function Filter({
  filter,
  setFilter,
  filterAllData,
  setFilterAllData,
  ...inputProps
}: RootProps & {
  filter: string
  setFilter: (filter: string) => void
  filterAllData?: boolean
  setFilterAllData: (filterAllData: boolean) => void
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
      placeholder={
        filterAllData
          ? 'Search all request data'
          : 'Search URL, method, or status code'
      }
      size="2"
      onChange={setFilter}
    >
      <TextField.Slot px="1">
        <Tooltip content="Search all request data, including headers, cookies, payload, and response data">
          <IconButton
            variant={filterAllData ? 'solid' : 'ghost'}
            size="1"
            onClick={() => setFilterAllData(!filterAllData)}
            // Override ghost button margin
            css={{ margin: '0' }}
          >
            <CodeXmlIcon />
          </IconButton>
        </Tooltip>
      </TextField.Slot>
    </SearchField>
  )
}
