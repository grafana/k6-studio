import { Select } from '@radix-ui/themes'
import { ReactNode } from 'react'
import { Control, Controller, FieldValues, Path } from 'react-hook-form'

type Option = { label: ReactNode; value: string; disabled?: boolean }
type GroupedOption = { label: string; options: Option[] }

interface ControlledSelectProps<
  T extends FieldValues,
  O extends Option | GroupedOption,
> {
  name: Path<T>
  control: Control<T>
  options: O[]
  selectProps?: Select.RootProps
  contentProps?: Select.ContentProps
  onChange?: (value: O extends Option ? O['value'] : string) => void
}

export function ControlledSelect<
  T extends FieldValues,
  O extends Option | GroupedOption,
>({
  name,
  control,
  options,
  selectProps = {},
  contentProps = {},
  onChange,
}: ControlledSelectProps<T, O>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Select.Root
          {...selectProps}
          value={field.value}
          onValueChange={onChange ?? field.onChange}
        >
          <Select.Trigger
            onBlur={field.onBlur}
            id={name}
            css={{ width: '100%' }}
          />
          <Select.Content {...contentProps}>
            {options.map((option) =>
              'options' in option ? (
                <Select.Group key={option.label}>
                  <Select.Label>{option.label}</Select.Label>
                  {option.options.map((subOption) => (
                    <Select.Item
                      key={subOption.value}
                      value={subOption.value}
                      disabled={subOption.disabled}
                    >
                      {subOption.label}
                    </Select.Item>
                  ))}
                </Select.Group>
              ) : (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </Select.Item>
              )
            )}
          </Select.Content>
        </Select.Root>
      )}
    />
  )
}
