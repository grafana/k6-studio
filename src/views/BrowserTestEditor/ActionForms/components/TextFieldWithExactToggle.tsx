import { IconButton, TextField, Tooltip } from '@radix-ui/themes'
import { WholeWordIcon } from 'lucide-react'

interface TextFieldWithExactToggleProps {
  name: string
  value: string
  exact?: boolean
  onValueChange: (value: string) => void
  onExactChange: (exact: boolean) => void
  onBlur?: () => void
}

export function TextFieldWithExactToggle({
  name,
  value,
  exact,
  onValueChange,
  onExactChange,
  onBlur,
}: TextFieldWithExactToggleProps) {
  return (
    <TextField.Root
      size="1"
      name={name}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      onBlur={onBlur}
    >
      <TextField.Slot side="right">
        <Tooltip content="Exact match">
          <IconButton
            size="1"
            aria-label="Toggle exact match"
            aria-pressed={exact ? 'true' : 'false'}
            variant="ghost"
            color={exact ? 'orange' : 'gray'}
            onClick={() => {
              onExactChange(!exact)
              onBlur?.()
            }}
          >
            <WholeWordIcon />
          </IconButton>
        </Tooltip>
      </TextField.Slot>
    </TextField.Root>
  )
}
