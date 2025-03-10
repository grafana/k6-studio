import { Flex, RadioGroup } from '@radix-ui/themes'
import { Control, Controller, FieldValues, Path } from 'react-hook-form'

type Option = { label: string; value: string }

interface ControlledRadioGroupProps<T extends FieldValues, O extends Option> {
  name: Path<T>
  control: Control<T>
  options: O[]
  direction?: 'column' | 'row'
  radioGroupProps?: RadioGroup.RootProps
  onChange?: (value: O['value']) => void
}

export function ControlledRadioGroup<T extends FieldValues, O extends Option>({
  name,
  control,
  options,
  direction = 'column',
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
          asChild
        >
          <Flex
            direction={direction}
            gap={direction === 'column' ? undefined : '2'}
          >
            {options.map((option) => (
              <RadioGroup.Item key={option.value} value={option.value}>
                {option.label}
              </RadioGroup.Item>
            ))}
          </Flex>
        </RadioGroup.Root>
      )}
    />
  )
}
