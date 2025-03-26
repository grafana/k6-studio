import { Flex, Select, Tooltip, TooltipProps } from '@radix-ui/themes'
import { ReactNode } from 'react'
import { Control, Controller, FieldValues, Path } from 'react-hook-form'

type Option = {
  label: ReactNode
  value: string
  disabled?: boolean
  icon?: ReactNode
}
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
  tooltipProps?: TooltipProps
  onChange?: (value: O extends Option ? O['value'] : string) => void
  triggerValue?: (value: string) => ReactNode
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
  tooltipProps = { content: undefined, hidden: true },
  onChange,
  triggerValue,
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
          <Tooltip {...tooltipProps}>
            <Select.Trigger
              onBlur={field.onBlur}
              id={name}
              css={{ width: '100%' }}
            >
              {triggerValue ? triggerValue(field.value) : undefined}
            </Select.Trigger>
          </Tooltip>
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
                      <Flex justify="between" align="center" gap="1">
                        {option.label} {subOption.icon}
                      </Flex>
                    </Select.Item>
                  ))}
                </Select.Group>
              ) : (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  <Flex justify="between" align="center" gap="1">
                    {option.label} {option.icon}
                  </Flex>
                </Select.Item>
              )
            )}
          </Select.Content>
        </Select.Root>
      )}
    />
  )
}
