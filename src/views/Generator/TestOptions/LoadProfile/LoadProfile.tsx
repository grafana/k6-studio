import { zodResolver } from '@hookform/resolvers/zod'
import { Text } from '@radix-ui/themes'
import { useCallback, useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { LoadProfileExecutorOptionsSchema } from '@/schemas/generator'
import { LoadProfileExecutorOptions } from '@/types/testOptions'

import { Executor } from './components/Executor'
import { ExecutorOptions } from './components/ExecutorOptions'

interface LoadProfileProps {
  loadProfile: LoadProfileExecutorOptions
  onLoadProfileChange: (data: LoadProfileExecutorOptions) => void
}

export function LoadProfile({
  loadProfile,
  onLoadProfileChange,
}: LoadProfileProps) {
  const formMethods = useForm<LoadProfileExecutorOptions>({
    resolver: zodResolver(LoadProfileExecutorOptionsSchema),
    shouldFocusError: false,
    defaultValues: loadProfile,
  })
  const { watch, handleSubmit, reset } = formMethods

  useEffect(() => {
    reset(loadProfile)
  }, [loadProfile, reset])

  const data = formMethods.watch()

  const onSubmit = useCallback(
    (data: LoadProfileExecutorOptions) => {
      onLoadProfileChange(data)
    },
    [onLoadProfileChange]
  )

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
      <form onSubmit={formMethods.handleSubmit(onSubmit)}>
        <Executor />
        <ExecutorOptions executor={data.executor} />
      </form>
    </FormProvider>
  )
}
