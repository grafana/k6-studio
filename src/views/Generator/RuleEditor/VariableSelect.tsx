import { Code, Flex } from '@radix-ui/themes'
import { ControlledSelect, FieldGroup } from '@/components/Form'
import { Control, FieldErrors, FieldValues, Path } from 'react-hook-form'
import { useGeneratorStore } from '@/store/generator'
import { useMemo } from 'react'

export function VariableSelect<T extends FieldValues>({
  control,
  errors,
  value,
  name,
}: {
  control: Control<T>
  errors: FieldErrors<T>
  name: Path<T>
  value?: string
}) {
  const variables = useGeneratorStore((store) => store.variables)

  const options = useMemo(() => {
    return variables.map((variable) => ({
      value: variable.name,
      label: (
        <Flex gap="1" align="center">
          <Code size="2" truncate variant="ghost" color="blue">
            {variable.name}
          </Code>
          <Code truncate size="1" variant="ghost" css={{ flex: '1' }}>
            {variable.value}
          </Code>
        </Flex>
      ),
    }))
  }, [variables])

  return (
    <FieldGroup name={name} errors={errors} label="Variable">
      <ControlledSelect
        options={options}
        control={control}
        name={name}
        selectProps={{
          // Automatically open the select when switching to variable type
          // in new parameterization rule
          defaultOpen: !value,
        }}
        contentProps={{
          css: { maxWidth: 'var(--radix-select-trigger-width)' },
          position: 'popper',
        }}
      />
    </FieldGroup>
  )
}
