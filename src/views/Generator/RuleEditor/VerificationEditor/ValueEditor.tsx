import { Grid, TextField } from '@radix-ui/themes'
import { useCallback, useEffect, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'

import { ControlledSelect, FieldGroup } from '@/components/Form'
import { useGeneratorStore } from '@/store/generator'
import { VerificationRule } from '@/types/rules'

import { VariableSelect } from '../VariableSelect'

import {
  getValueTypeOptions,
  getOperatorOptions,
  getAvailableValueTypes,
} from './ValueEditor.utils'

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
  const target = watch('target')

  const valueTypeOptions = useMemo(
    () => getValueTypeOptions(target, hasVariables),
    [target, hasVariables]
  )

  const operatorOptions = useMemo(
    () => getOperatorOptions(target, valueType),
    [target, valueType]
  )

  const handleChangeValueType = useCallback(
    (value: VerificationRule['value']['type']) => {
      if (value === 'recordedValue') {
        setValue('operator', 'equals')
      }

      if (value === 'number') {
        setValue('value.number', 200)
        setValue('operator', 'equals')
      }

      if (value === 'string') {
        setValue('value.value', '')
        setValue('operator', 'contains')
      }

      if (value === 'regex') {
        setValue('value.regex', '.*')
        setValue('operator', 'matches')
      }

      setValue('value.type', value)
    },
    [setValue]
  )

  // Update dropdown values when target changes
  useEffect(() => {
    const firstAvailableValueType = getAvailableValueTypes(target)[0]
    firstAvailableValueType && handleChangeValueType(firstAvailableValueType)
  }, [target, handleChangeValueType])

  return (
    <>
      <FieldGroup name="value.type" label="Check against">
        <ControlledSelect
          control={control}
          name="value.type"
          options={valueTypeOptions}
          onChange={handleChangeValueType}
        />
      </FieldGroup>

      {!['recordedValue', 'regex'].includes(valueType) && (
        <Grid gap="2" columns="auto 1fr">
          <FieldGroup name="operator" errors={errors} label="Operator">
            <ControlledSelect
              name="operator"
              control={control}
              options={operatorOptions}
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

          {valueType === 'number' && (
            <FieldGroup name="value.number" errors={errors} label="Value">
              <TextField.Root
                placeholder="Enter number"
                type="number"
                {...register('value.number', {
                  valueAsNumber: true,
                })}
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
        </Grid>
      )}

      {valueType === 'regex' && (
        <FieldGroup name="value.regex" errors={errors} label="Regex pattern">
          <TextField.Root
            placeholder="Enter regex pattern"
            {...register('value.regex')}
          >
            <TextField.Slot>/</TextField.Slot>
            <TextField.Slot>/</TextField.Slot>
          </TextField.Root>
        </FieldGroup>
      )}
    </>
  )
}
