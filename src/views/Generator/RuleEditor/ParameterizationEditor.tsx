import {
  Box,
  Code,
  Flex,
  Grid,
  Heading,
  Text,
  TextField,
} from '@radix-ui/themes'
import { FilterField } from './FilterField'
import { SelectorField } from './SelectorField'
import { ControlledSelect, FieldGroup } from '@/components/Form'
import { ParameterizationRule } from '@/types/rules'
import { useFormContext } from 'react-hook-form'
import { useGeneratorStore } from '@/store/generator'
import { useMemo } from 'react'
import { exhaustive } from '@/utils/typescript'

export function ParameterizationEditor() {
  return (
    <>
      <Heading size="2" weight="medium" mb="2">
        Parameterization
      </Heading>

      <Text size="2" as="p" mb="2" color="gray">
        Replace request data with variables or custom values.
      </Text>
      <Grid columns="2" gap="3">
        <Box>
          <FilterField field="filter" />
          <SelectorField field="selector" />
        </Box>
        <Box>
          <ValueEditor />
        </Box>
      </Grid>
    </>
  )
}
// TODO: extract components

const VALUE_TYPE_OPTIONS = [
  { value: 'string', label: 'Text value' },
  { value: 'variable', label: 'Variable' },
]

export function ValueEditor() {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<ParameterizationRule>()

  function _handleTypeChange(value: ParameterizationRule['value']['type']) {
    setValue('value.type', value)
    if (value === 'variable') {
      setValue('value.value', '')
    }

    if (value === 'string') {
      setValue('value.variableName', '')
    }
  }
  // TODO: string value needs to be defaulted to empty string

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
      throw new Error('Not implemented')

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
    formState: { errors },
  } = useFormContext<ParameterizationRule>()

  return (
    <FieldGroup name="value.variableName" errors={errors} label="Variable">
      <ControlledSelect
        options={options}
        control={control}
        name="value.variableName"
        contentProps={{
          css: { maxWidth: 'var(--radix-select-trigger-width)' },
          position: 'popper',
        }}
      />
    </FieldGroup>
  )
}
