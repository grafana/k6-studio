import { css } from '@emotion/react'
import { IconButton, TextField, Tooltip } from '@radix-ui/themes'
import { WholeWordIcon } from 'lucide-react'

interface TextFieldWithExactToggleProps {
  name: string
  value: string
  exact?: boolean
  exactDisabled?: boolean
  onValueChange: (value: string) => void
  onExactChange: (exact: boolean) => void
  onBlur?: () => void
}

export function TextFieldWithExactToggle({
  name,
  value,
  exact,
  exactDisabled,
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
            disabled={exactDisabled}
            aria-label="Toggle exact match"
            aria-pressed={exact ? 'true' : 'false'}
            variant="ghost"
            color={exact ? 'orange' : 'gray'}
            onClick={() => {
              onExactChange(!exact)
              onBlur?.()
            }}
            css={css`
              margin-right: -var(--space-1);
            `}
          >
            <WholeWordIcon />
          </IconButton>
        </Tooltip>
      </TextField.Slot>
    </TextField.Root>
  )
}
