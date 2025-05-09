import { IconButton, TextField } from '@radix-ui/themes'
import { RootProps } from '@radix-ui/themes/dist/cjs/components/text-field'
import { SearchIcon, XIcon } from 'lucide-react'
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react'

export interface SearchFieldHandle {
  focus(): void
  clear(): void
}

type SearchFieldProps = Omit<RootProps, 'onChange'> & {
  filter: string
  onChange: (filter: string) => void
  children?: React.ReactNode
}

export const SearchField = forwardRef<SearchFieldHandle, SearchFieldProps>(
  function SearchField({ filter, onChange, children, ...inputProps }, ref) {
    const inputRef = useRef<HTMLInputElement | null>(null)

    const clear = useCallback(() => {
      onChange('')
    }, [onChange])

    useImperativeHandle(ref, () => {
      return {
        clear,
        focus() {
          inputRef.current?.focus()
          inputRef.current?.select()
        },
      }
    }, [clear])

    return (
      <TextField.Root
        ref={inputRef}
        value={filter}
        onChange={(e) => onChange(e.target.value)}
        {...inputProps}
      >
        <TextField.Slot>
          <SearchIcon />
        </TextField.Slot>
        {filter !== '' && (
          <TextField.Slot>
            <IconButton variant="ghost" size="1" onClick={clear}>
              <XIcon />
            </IconButton>
          </TextField.Slot>
        )}
        {children}
      </TextField.Root>
    )
  }
)
