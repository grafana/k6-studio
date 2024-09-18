import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Flex, TextField } from '@radix-ui/themes'

import { selectIsGroupedRecording, useGeneratorStore } from '@/store/generator'
import { ThinkTimeSchema } from '@/schemas/testOptions'
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
  const isGroupedRecording = useGeneratorStore(selectIsGroupedRecording)
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
      <FieldGroup name="timing.type" label="Type" errors={errors}>
        <ControlledSelect
          name="timing.type"
          control={control}
          options={TYPE_OPTIONS}
          onChange={handleTypeChange}
        />
      </FieldGroup>

      {data.timing.type === 'fixed' && (
        <FieldGroup name="timing.value" label="Duration" errors={errors}>
          <TextField.Root
            size="2"
            min="0"
            placeholder="seconds"
            type="number"
            id="timing.value"
            {...register('timing.value', {
              setValueAs: stringAsNullableNumber,
            })}
          >
            <TextField.Slot side="right">s</TextField.Slot>
          </TextField.Root>
        </FieldGroup>
      )}

      {data.timing.type === 'range' && (
        <Flex gap="2">
          <Box width="50%">
            <FieldGroup
              name="timing.value.min"
              label="Min duration"
              errors={errors}
            >
              <TextField.Root
                size="2"
                min={0}
                placeholder="min"
                type="number"
                id="timing.value.min"
                {...register('timing.value.min', {
                  setValueAs: stringAsOptionalNumber,
                })}
              >
                <TextField.Slot side="right">s</TextField.Slot>
              </TextField.Root>
            </FieldGroup>
          </Box>
          <Box width="50%">
            <FieldGroup
              name="timing.value.max"
              label="Max duration"
              errors={errors}
            >
              <TextField.Root
                size="2"
                min={0}
                placeholder="max"
                type="number"
                id="timing.value.max"
                {...register('timing.value.max', {
                  setValueAs: stringAsOptionalNumber,
                })}
              >
                <TextField.Slot side="right">s</TextField.Slot>
              </TextField.Root>
            </FieldGroup>
          </Box>
        </Flex>
      )}

      <FieldGroup name="sleepType" label="Position" errors={errors}>
        <ControlledSelect
          name="sleepType"
          control={control}
          options={SLEEP_TYPE_OPTIONS.filter(({ value }) =>
            isGroupedRecording ? value !== 'requests' : true
          )}
        />
      </FieldGroup>
    </form>
  )
}
