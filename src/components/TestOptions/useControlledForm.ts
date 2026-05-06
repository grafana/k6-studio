import { isEqual } from 'lodash-es'
import { useCallback, useEffect } from 'react'
import {
  useForm,
  type FieldValues,
  type UseFormProps,
  type UseFormReturn,
} from 'react-hook-form'

import { stripUndefined } from '@/utils/object'

interface UseControlledFormOptions<T extends FieldValues> extends Omit<
  UseFormProps<T>,
  'defaultValues'
> {
  value: T
  onChange: (next: T) => void
}

export function useControlledForm<T extends FieldValues>({
  value,
  onChange,
  ...formOptions
}: UseControlledFormOptions<T>): UseFormReturn<T> {
  const formMethods = useForm<T>({
    shouldFocusError: false,
    ...formOptions,
    defaultValues: value as UseFormProps<T>['defaultValues'],
  })
  const { watch, handleSubmit, reset, getValues } = formMethods

  const onSubmit = useCallback((next: T) => onChange(next), [onChange])

  // Strip undefined entries before comparing so cleared form fields (which
  // RHF emits as `key: undefined`) deep-equal saved state where the key is
  // absent entirely. Prevents reset loops on reference-only changes.
  useEffect(() => {
    if (!isEqual(stripUndefined(getValues()), stripUndefined(value))) {
      reset(value)
    }
  }, [value, reset, getValues])

  useEffect(() => {
    const subscription = watch(() => handleSubmit(onSubmit)())
    return () => subscription.unsubscribe()
  }, [watch, handleSubmit, onSubmit])

  return formMethods
}
