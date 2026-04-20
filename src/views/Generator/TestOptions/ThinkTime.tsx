import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Flex, TextField, Text, Grid } from '@radix-ui/themes'
import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { FieldGroup } from '@/components/Form'
import { ControlledRadioGroup } from '@/components/Form/ControllerRadioGroup'
import { ThinkTimeSchema } from '@/schemas/generator'
import type { ThinkTime } from '@/types/testOptions'
import { stringAsNullableNumber, stringAsOptionalNumber } from '@/utils/form'

const TYPE_OPTIONS = [
  { value: 'fixed', label: 'Fixed' },
  { value: 'range', label: 'Random' },
]

const SLEEP_TYPE_OPTIONS = [
  { value: 'groups', label: 'Between groups' },
  { value: 'requests', label: 'Between requests' },
  { value: 'iterations', label: 'End of iteration' },
]

interface ThinkTimeProps {
  thinkTime: Pick<ThinkTime, 'sleepType' | 'timing'>
  hasGroups: boolean
  onThinkTimeChange: (data: Pick<ThinkTime, 'sleepType' | 'timing'>) => void
}

export function ThinkTime({
  thinkTime: { sleepType, timing },
  hasGroups,
  onThinkTimeChange,
}: ThinkTimeProps) {
  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ThinkTime>({
    resolver: zodResolver(ThinkTimeSchema),
    defaultValues: {
      sleepType,
      timing,
    },
    shouldFocusError: false,
  })

  useEffect(() => {
    reset({ sleepType, timing })
  }, [sleepType, timing, reset])

  const data = watch()

  const onSubmit = useCallback(
    (data: ThinkTime) => {
      onThinkTimeChange({
        sleepType: data.sleepType,
        timing: data.timing,
      })
    },
    [onThinkTimeChange]
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
      <Text size="2" as="p" mb="2">
        Simulate delays that real users have to make your test script more
        realistic.
      </Text>
      <Grid columns="1fr 1fr" gap="2">
        <FieldGroup name="timing.type" label="Delay type" errors={errors}>
          <ControlledRadioGroup
            name="timing.type"
            control={control}
            options={TYPE_OPTIONS}
            onChange={handleTypeChange}
          />
        </FieldGroup>

        <FieldGroup name="sleepType" label="Placement" errors={errors}>
          <ControlledRadioGroup
            name="sleepType"
            control={control}
            options={SLEEP_TYPE_OPTIONS.filter(({ value }) => {
              if (value === 'groups') return hasGroups
              if (value === 'requests') return !hasGroups
              return true
            })}
          />
        </FieldGroup>
      </Grid>

      {data.timing.type === 'fixed' && (
        <Flex gap="2">
          <Box width="50%">
            <FieldGroup name="timing.value" label="Duration" errors={errors}>
              <TextField.Root
                size="2"
                min="0"
                placeholder="e.g. 1"
                type="number"
                id="timing.value"
                {...register('timing.value', {
                  setValueAs: stringAsNullableNumber,
                })}
              >
                <TextField.Slot side="right">s</TextField.Slot>
              </TextField.Root>
            </FieldGroup>
          </Box>
        </Flex>
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
                placeholder="e.g. 1"
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
                placeholder="e.g. 3"
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
    </form>
  )
}
