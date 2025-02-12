import { TextField } from '@radix-ui/themes'
import { ControlledSelect, FieldGroup } from '@/components/Form'
import { ParameterizationRule } from '@/types/rules'
import { useFormContext } from 'react-hook-form'
import { useGeneratorStore } from '@/store/generator'
import { exhaustive } from '@/utils/typescript'
import { VariableSelect } from './VariableSelect'
import { CustomCode } from './CustomCode'

export function ValueEditor() {
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

    case 'customCode':
      return <CustomCode />

    default:
      return exhaustive(type)
  }
}
