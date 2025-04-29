import * as Label from '@radix-ui/react-label'
import { Flex, TextField, Tooltip } from '@radix-ui/themes'
import { InfoIcon } from 'lucide-react'
import { type ChangeEvent, type ReactNode } from 'react'

interface DurationInputProps extends Omit<TextField.RootProps, 'onChange'> {
  label: string
  tooltip?: string
  onChange: (value: string) => void
}

export function DurationInput({
  label,
  value = '',
  placeholder = '0s',
  tooltip,
  onChange,
  ...props
}: DurationInputProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isStageDurationAllowedInput(event.target.value)) {
      return
    }

    onChange(event.target.value)
  }

  return (
    <Flex direction="column" gap="1">
      <Flex align="center" gap="1">
        <Label.Root>{label}</Label.Root>

        <Tooltip
          content={<DurationInfo fieldName={label}>{tooltip}</DurationInfo>}
        >
          <InfoIcon />
        </Tooltip>
      </Flex>

      <TextField.Root
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        {...props}
      />
    </Flex>
  )
}

interface DurationInfoProps {
  fieldName: string
  children?: ReactNode
}

function DurationInfo({ fieldName, children }: DurationInfoProps) {
  return (
    <>
      {children && (
        <>
          {children}
          <br />
          <br />
        </>
      )}
      {fieldName} should be specified in <b>h</b>, <b>m</b>, or <b>s</b>.
      Multiple can be combined, e.g.{' '}
      <i>
        10<b>m</b>30<b>s</b>
      </i>
      .
    </>
  )
}

/**
 * Returns whether input is an allowed duration input
 * Note: Only checks if the `input` has potential to be valid (us `isStageDurationValid` for
 * validation of the "end result").
 *
 * @param {string} input
 */
function isStageDurationAllowedInput(input: string) {
  return /^[hms\d]*$/.test(input)
}
