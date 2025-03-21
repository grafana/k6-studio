import { ComponentProps, ReactNode } from 'react'
import { Control, Controller, FieldValues, Path } from 'react-hook-form'

import { StyledReactSelect } from '../StyledReactSelect'

type Option = { label: ReactNode; value: string; disabled?: boolean }

interface ControlledSelectProps<T extends FieldValues, O extends Option> {
  name: Path<T>
  control: Control<T>
  options: O[]
  selectProps?: ComponentProps<typeof StyledReactSelect<O>>
  onChange?: (value?: O['value']) => void
}

export function ControlledReactSelect<T extends FieldValues, O extends Option>({
  name,
  control,
  options,
  onChange,
  selectProps = {},
}: ControlledSelectProps<T, O>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <StyledReactSelect
          onChange={(option) =>
            onChange ? onChange(option?.value) : field.onChange(option?.value)
          }
          onBlur={field.onBlur}
          value={options.find((option) => option.value === field.value)}
          isDisabled={field.disabled}
          options={options}
          {...selectProps}
        />
      )}
    />
  )
}
