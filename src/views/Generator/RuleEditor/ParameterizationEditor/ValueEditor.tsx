import { TextField } from '@radix-ui/themes'
import { useFormContext } from 'react-hook-form'

import { ControlledSelect, FieldGroup } from '@/components/Form'
import { useGeneratorStore } from '@/store/generator'
import { ParameterizationRule } from '@/types/rules'
import { exhaustive } from '@/utils/typescript'

import { VariableSelect } from '../VariableSelect'

import { CustomCode } from './CustomCode'
import { FileSelect } from './FileSelect'

export function ValueEditor() {
  const {
    control,
    formState: { errors },
  } = useFormContext<ParameterizationRule>()

  const hasVariables = useGeneratorStore((state) => state.variables.length > 0)
  const hasFiles = useGeneratorStore((state) => state.files.length > 0)

  const VALUE_TYPE_OPTIONS = [
    { value: 'string', label: 'Text value' },
    { value: 'variable', label: 'Variable', disabled: !hasVariables },
    {
      value: 'dataFileValue',
      label: 'Data file',
      disabled: !hasFiles,
    },
    { value: 'customCode', label: 'Custom code' },
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
    control,
  } = useFormContext<ParameterizationRule>()

  const type = watch('value.type')
  const variableName = watch('value.variableName')

  switch (type) {
    case 'string':
      return (
        <FieldGroup name="value.value" errors={errors} label="Value">
          <TextField.Root placeholder="Value" {...register('value.value')} />
        </FieldGroup>
      )
    case 'variable':
      return (
        <VariableSelect
          control={control}
          errors={errors}
          value={variableName}
          name="value.variableName"
        />
      )

    case 'dataFileValue':
      return <FileSelect />

    case 'customCode':
      return <CustomCode />

    default:
      return exhaustive(type)
  }
}
