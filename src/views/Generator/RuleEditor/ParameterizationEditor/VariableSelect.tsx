import { Code, Flex } from '@radix-ui/themes'
import { ControlledSelect, FieldGroup } from '@/components/Form'
import { ParameterizationRule } from '@/types/rules'
import { useFormContext } from 'react-hook-form'
import { useGeneratorStore } from '@/store/generator'
import { useMemo } from 'react'

export function VariableSelect() {
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

  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<ParameterizationRule>()

  const variableName = watch('value.variableName')

  return (
    <FieldGroup name="value.variableName" errors={errors} label="Variable">
      <ControlledSelect
        options={options}
        control={control}
        name="value.variableName"
        selectProps={{
          // Automatically open the select when switching to variable type
          // in new parameterization rule
          defaultOpen: !variableName,
        }}
        contentProps={{
          css: { maxWidth: 'var(--radix-select-trigger-width)' },
          position: 'popper',
        }}
      />
    </FieldGroup>
  )
}
