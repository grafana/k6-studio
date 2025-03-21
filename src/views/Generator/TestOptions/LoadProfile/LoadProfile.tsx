import { zodResolver } from '@hookform/resolvers/zod'
import { Text } from '@radix-ui/themes'
import { useCallback, useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { LoadProfileExecutorOptionsSchema } from '@/schemas/generator'
import { useGeneratorStore } from '@/store/generator'
import { LoadProfileExecutorOptions } from '@/types/testOptions'

import { Executor } from './components/Executor'
import { ExecutorOptions } from './components/ExecutorOptions'

export function LoadProfile() {
  const executor = useGeneratorStore((store) => store.executor)
  const setExecutor = useGeneratorStore((store) => store.setExecutor)

  const stages = useGeneratorStore((store) => store.stages)
  const setStages = useGeneratorStore((store) => store.setStages)

  const vus = useGeneratorStore((store) => store.vus)
  const setVus = useGeneratorStore((store) => store.setVus)

  const iterations = useGeneratorStore((store) => store.iterations)
  const setIterations = useGeneratorStore((store) => store.setIterations)

  const formMethods = useForm<LoadProfileExecutorOptions>({
    resolver: zodResolver(LoadProfileExecutorOptionsSchema),
    shouldFocusError: false,
    defaultValues: {
      executor,
      stages,
      vus,
      iterations,
    },
  })
  const { watch, handleSubmit } = formMethods

  const data = formMethods.watch()

  const onSubmit = useCallback(
    (data: LoadProfileExecutorOptions) => {
      setExecutor(data.executor)

      if (data.executor === 'ramping-vus') {
        setStages(data.stages)
      }

      if (data.executor === 'shared-iterations') {
        setVus(data.vus)
        setIterations(data.iterations)
      }
    },
    [setExecutor, setIterations, setStages, setVus]
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
