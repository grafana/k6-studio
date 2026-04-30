import { zodResolver } from '@hookform/resolvers/zod'
import { Text } from '@radix-ui/themes'
import { isEqual } from 'lodash-es'
import { useCallback, useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { LoadProfileExecutorOptionsSchema } from '@/schemas/generator'
import { LoadProfileExecutorOptions } from '@/types/testOptions'

import { Executor } from './components/Executor'
import { ExecutorOptions } from './components/ExecutorOptions'

interface LoadProfileProps {
  value: LoadProfileExecutorOptions
  onChange: (next: LoadProfileExecutorOptions) => void
  executors: ReadonlyArray<LoadProfileExecutorOptions['executor']>
}

export function LoadProfile({ value, onChange, executors }: LoadProfileProps) {
  const formMethods = useForm<LoadProfileExecutorOptions>({
    resolver: zodResolver(LoadProfileExecutorOptionsSchema),
    shouldFocusError: false,
    defaultValues: value,
  })
  const { watch, handleSubmit, reset, getValues } = formMethods

  const executor = watch('executor')

  const onSubmit = useCallback(
    (next: LoadProfileExecutorOptions) => {
      onChange(next)
    },
    [onChange]
  )

  // Keep form synced when external value changes
  useEffect(() => {
    const current = getValues()
    if (!isEqual(current, value)) {
      reset(value)
    }
  }, [value, reset, getValues])

  // Submit onChange
  useEffect(() => {
    const subscription = watch(() => handleSubmit(onSubmit)())
    return () => subscription.unsubscribe()
  }, [watch, handleSubmit, onSubmit])

  return (
    <FormProvider {...formMethods}>
      <Text size="2" as="p" mb="2">
        Control how k6 schedules VUs and iterations to model your desired load
        profile.
      </Text>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Executor executors={executors} />
        <ExecutorOptions executor={executor} />
      </form>
    </FormProvider>
  )
}
