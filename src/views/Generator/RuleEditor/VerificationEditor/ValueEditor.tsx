import { TextField } from '@radix-ui/themes'
import { ControlledSelect, FieldGroup } from '@/components/Form'
import { VerificationRule } from '@/types/rules'
import { useFormContext } from 'react-hook-form'
import { useGeneratorStore } from '@/store/generator'
import { VariableSelect } from '../VariableSelect'

export function ValueEditor() {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<VerificationRule>()

  const hasVariables = useGeneratorStore((state) => state.variables.length > 0)

  const valueType = watch('value.type')
  const variableName = watch('value.variableName')

  const VALUE_TYPE_OPTIONS = [
    { value: 'recordedValue', label: 'Recorded value' },
    { value: 'string', label: 'Text value' },
    { value: 'variable', label: 'Variable', disabled: !hasVariables },
  ]

  return (
    <>
      <FieldGroup name="value.type" errors={errors} label="Value type">
        <ControlledSelect
          control={control}
          name="value.type"
          options={VALUE_TYPE_OPTIONS}
        />
      </FieldGroup>

      {valueType === 'string' && (
        <FieldGroup name="value.value" errors={errors} label="Value">
          <TextField.Root
            placeholder="Enter value"
            {...register('value.value')}
          />
        </FieldGroup>
      )}

      {valueType === 'variable' && (
        <VariableSelect
          control={control}
          errors={errors}
          value={variableName}
          name="value.variableName"
        />
      )}
    </>
  )
}
