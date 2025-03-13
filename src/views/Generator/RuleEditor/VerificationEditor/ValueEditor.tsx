import { TextField } from '@radix-ui/themes'
import { ControlledSelect, FieldGroup } from '@/components/Form'
import { VerificationRule } from '@/types/rules'
import { useFormContext } from 'react-hook-form'
import { useGeneratorStore } from '@/store/generator'
import { VariableSelect } from '../VariableSelect'

const OPERATOR_OPTIONS = [
  { value: 'equals', label: 'Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'notContains', label: 'Does not contain' },
]

export function ValueEditor() {
  const {
    control,
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<VerificationRule>()

  const hasVariables = useGeneratorStore((state) => state.variables.length > 0)

  const valueType = watch('value.type')
  const variableName = watch('value.variableName')

  const VALUE_TYPE_OPTIONS: Array<{
    value: VerificationRule['value']['type']
    label: string
    disabled?: boolean
  }> = [
    { value: 'recordedValue', label: 'Recorded value' },
    { value: 'string', label: 'Text value' },
    { value: 'variable', label: 'Variable', disabled: !hasVariables },
  ]

  const handleToggleValueType = (value: VerificationRule['value']['type']) => {
    if (value === 'recordedValue') {
      setValue('operator', 'equals')
    }

    setValue('value.type', value)
  }

  return (
    <>
      <FieldGroup name="value.type" errors={errors} label="Compare with">
        <ControlledSelect
          control={control}
          name="value.type"
          options={VALUE_TYPE_OPTIONS}
          onChange={handleToggleValueType}
        />
      </FieldGroup>

      {valueType !== 'recordedValue' && (
        <FieldGroup name="operator" errors={errors} label="Operator">
          <ControlledSelect
            name="operator"
            control={control}
            options={OPERATOR_OPTIONS}
          />
        </FieldGroup>
      )}

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
