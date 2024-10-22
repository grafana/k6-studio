import { Code, Flex, Text, TextField } from '@radix-ui/themes'
import { ControlledSelect, FieldGroup } from '@/components/Form'
import { ParameterizationRule } from '@/types/rules'
import { useFormContext } from 'react-hook-form'
import { useGeneratorStore } from '@/store/generator'
import { useMemo } from 'react'
import { exhaustive } from '@/utils/typescript'

export function ParamaterizationValueEditor() {
  const {
    control,
    formState: { errors },
  } = useFormContext<ParameterizationRule>()

  const variablesExist = useGeneratorStore(
    (state) => state.variables.length > 0
  )

  const variablesLabel = variablesExist
    ? 'Variables'
    : 'Variables (add in test options)'

  const VALUE_TYPE_OPTIONS = [
    { value: 'string', label: 'Text value' },
    { value: 'variable', label: variablesLabel, disabled: !variablesExist },
  ]

  return (
    <>
      <FieldGroup name="value.type" errors={errors} label="Replace with">
        <ControlledSelect
          control={control}
          name="value.type"
          options={VALUE_TYPE_OPTIONS}
        />
      </FieldGroup>
      <ValueTypeSwitch />
    </>
  )
}

function ValueTypeSwitch() {
  const {
    watch,
    register,
    formState: { errors },
  } = useFormContext<ParameterizationRule>()

  const type = watch('value.type')

  switch (type) {
    case 'string':
      return (
        <FieldGroup name="value.value" errors={errors} label="Value">
          <TextField.Root placeholder="Value" {...register('value.value')} />
        </FieldGroup>
      )
    case 'variable':
      return <VariableSelect />

    case 'array':
    case 'customCode':
      return null

    default:
      return exhaustive(type)
  }
}

function VariableSelect() {
  const variables = useGeneratorStore((store) => store.variables)

  const options = useMemo(() => {
    return variables.map((variable) => ({
      value: variable.name,
      label: (
        <Flex gap="1" align="center">
          <Code size="2" truncate>
            {variable.name}
          </Code>
          <Text truncate size="1" css={{ flex: '1' }}>
            {variable.value}
          </Text>
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
