import { InfoCircledIcon } from '@radix-ui/react-icons'
import { Box, Callout, Flex, TextField } from '@radix-ui/themes'
import { useGeneratorStore } from '@/store/generator'
import { ThinkTimeSchema } from '@/schemas/testOptions'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect } from 'react'
import type { ThinkTime } from '@/types/testOptions'
import { stringAsNullableNumber, stringAsOptionalNumber } from '@/utils/form'
import { ControlledSelect, FieldGroup } from '@/components/Form'

const TYPE_OPTIONS = [
  { value: 'fixed', label: 'Fixed' },
  { value: 'range', label: 'Range' },
]

const SLEEP_TYPE_OPTIONS = [
  { value: 'groups', label: 'Between groups' },
  { value: 'requests', label: 'Between requests' },
  { value: 'iterations', label: 'End of iteration' },
]

export function ThinkTime() {
  const sleepType = useGeneratorStore((store) => store.sleepType)
  const timing = useGeneratorStore((store) => store.timing)
  const setSleepType = useGeneratorStore((store) => store.setSleepType)
  const setTiming = useGeneratorStore((store) => store.setTiming)

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<ThinkTime>({
    resolver: zodResolver(ThinkTimeSchema),
    defaultValues: {
      sleepType,
      timing,
    },
    shouldFocusError: false,
  })

  const data = watch()

  const onSubmit = useCallback(
    (data: ThinkTime) => {
      setSleepType(data.sleepType)
      setTiming(data.timing)
    },
    [setSleepType, setTiming]
  )

  useEffect(() => {
    const subscription = watch(() => handleSubmit(onSubmit)())
    return () => subscription.unsubscribe()
  }, [watch, handleSubmit, onSubmit])

  function handleTypeChange(type: string) {
    if (type === 'fixed') {
      setValue('timing', { type: 'fixed', value: 1 })
    }
    if (type === 'range') {
      setValue('timing', { type: 'range', value: { min: 1, max: 3 } })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup name="timing.type" label="Configure timing" errors={errors}>
        <ControlledSelect
          name="timing.type"
          control={control}
          options={TYPE_OPTIONS}
          onChange={handleTypeChange}
        />
      </FieldGroup>

      {data.timing.type === 'fixed' && (
        <FieldGroup name="timing.value" label="Time in seconds" errors={errors}>
          <TextField.Root
            size="2"
            placeholder="seconds"
            type="number"
            id="timing.value"
            {...register('timing.value', {
              setValueAs: stringAsNullableNumber,
            })}
          />
        </FieldGroup>
      )}

      {data.timing.type === 'range' && (
        <Flex gap="2">
          <Box width="50%">
            <FieldGroup
              name="timing.value.min"
              label="Minimum time in seconds"
              errors={errors}
            >
              <TextField.Root
                size="2"
                placeholder="min"
                type="number"
                id="timing.value.min"
                {...register('timing.value.min', {
                  setValueAs: stringAsOptionalNumber,
                })}
              />
            </FieldGroup>
          </Box>
          <Box width="50%">
            <FieldGroup
              name="timing.value.max"
              label="Maximum time in seconds"
              errors={errors}
            >
              <TextField.Root
                size="2"
                placeholder="max"
                type="number"
                id="timing.value.max"
                {...register('timing.value.max', {
                  setValueAs: stringAsOptionalNumber,
                })}
              />
            </FieldGroup>
          </Box>
        </Flex>
      )}

      <FieldGroup
        name="sleepType"
        label="Choose where to apply timing"
        errors={errors}
      >
        <ControlledSelect
          name="sleepType"
          control={control}
          options={SLEEP_TYPE_OPTIONS}
        />
      </FieldGroup>

      {data.sleepType === 'requests' && (
        <Callout.Root color="amber" role="alert" variant="surface">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text wrap="balance">
            It is advisable not to use this option if you have included groups,
            as it may cause unexpected delays between requests, even within a
            group.
          </Callout.Text>
        </Callout.Root>
      )}
    </form>
  )
}
