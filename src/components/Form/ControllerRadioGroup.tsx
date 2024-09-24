import { RadioGroup } from '@radix-ui/themes'
import { Control, Controller, FieldValues, Path } from 'react-hook-form'

type Option = { label: string; value: string }

interface ControlledRadioGroupProps<T extends FieldValues, O extends Option> {
  name: Path<T>
  control: Control<T>
  options: O[]
  radioGroupProps?: RadioGroup.RootProps
  onChange?: (value: O['value']) => void
}

export function ControlledRadioGroup<T extends FieldValues, O extends Option>({
  name,
  control,
  options,
  radioGroupProps,
  onChange,
}: ControlledRadioGroupProps<T, O>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <RadioGroup.Root
          {...radioGroupProps}
          value={field.value}
          onValueChange={onChange ?? field.onChange}
        >
          {options.map((option) => (
            <RadioGroup.Item key={option.value} value={option.value}>
              {option.label}
            </RadioGroup.Item>
          ))}
        </RadioGroup.Root>
      )}
    />
  )
}
