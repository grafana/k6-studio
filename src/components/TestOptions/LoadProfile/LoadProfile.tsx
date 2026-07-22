import { zodResolver } from '@hookform/resolvers/zod'
import { Text } from '@radix-ui/themes'
import { FormProvider, Resolver } from 'react-hook-form'

import { LoadProfileExecutorOptionsSchema } from '@/schemas/generator'
import { LoadProfileExecutorOptions } from '@/types/testOptions'

import { useControlledForm } from '../useControlledForm'

import { Executor } from './components/Executor'
import { ExecutorOptions } from './components/ExecutorOptions'

interface LoadProfileProps {
  value: LoadProfileExecutorOptions
  onChange: (next: LoadProfileExecutorOptions) => void
  executors: ReadonlyArray<LoadProfileExecutorOptions['executor']>
}

export function LoadProfile({ value, onChange, executors }: LoadProfileProps) {
  const formMethods = useControlledForm<LoadProfileExecutorOptions>({
    value,
    onChange,
    // Stages carry a synthetic key, which zodResolver types as optional
    // input rather than the always-present output field the form actually
    // works with.
    resolver: zodResolver(
      LoadProfileExecutorOptionsSchema
    ) as Resolver<LoadProfileExecutorOptions>,
  })
  const { watch, handleSubmit } = formMethods

  const executor = watch('executor')

  return (
    <FormProvider {...formMethods}>
      <Text size="2" as="p" mb="2">
        Control how k6 schedules VUs and iterations to model your desired load
        profile.
      </Text>
      <form onSubmit={handleSubmit(onChange)}>
        <Executor executors={executors} />
        <ExecutorOptions executor={executor} />
      </form>
    </FormProvider>
  )
}
