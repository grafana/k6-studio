import { Select } from '@radix-ui/themes'
import { Control, Controller, FieldValues, Path } from 'react-hook-form'

type Option = { label: string; value: string }

interface ControlledSelectProps<T extends FieldValues, O extends Option> {
  name: Path<T>
  control: Control<T>
  options: O[]
  selectProps?: Select.RootProps
  onChange?: (value: O['value']) => void
}

export function ControlledSelect<T extends FieldValues, O extends Option>({
  name,
  control,
  options,
  selectProps = {},
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
          <Select.Content>
            {options.map((option) => (
              <Select.Item key={option.value} value={option.value}>
                {option.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      )}
    />
  )
}
