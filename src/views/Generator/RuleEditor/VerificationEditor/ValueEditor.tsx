import { TextField } from '@radix-ui/themes'
import { ControlledSelect, FieldGroup } from '@/components/Form'
import { VerificationRule } from '@/types/rules'
import { useFormContext } from 'react-hook-form'
import { useGeneratorStore } from '@/store/generator'

export function ValueEditor() {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<VerificationRule>()

  const hasVariables = useGeneratorStore((state) => state.variables.length > 0)
  const variables = useGeneratorStore((state) =>
    state.variables.map((v) => ({
      value: v.name,
      label: v.name,
    }))
  )
  const valueType = watch('value.type')

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
        <FieldGroup name="value.variableName" errors={errors} label="Variable">
          <ControlledSelect
            control={control}
            name="value.variableName"
            options={variables}
          />
        </FieldGroup>
      )}
    </>
  )
}
