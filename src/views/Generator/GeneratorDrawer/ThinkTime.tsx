import { InfoCircledIcon } from '@radix-ui/react-icons'
import * as Label from '@radix-ui/react-label'
import {
  Box,
  Callout,
  Container,
  Flex,
  Select,
  TextField,
  Text,
} from '@radix-ui/themes'
import { useGeneratorStore } from '@/store/generator'
import * as z from 'zod'
import { ThinkTimeSchema } from '@/schemas/testOptions'
import { Controller, FieldErrors, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect } from 'react'
import { ErrorMessage } from '@hookform/error-message'
import type { ThinkTime } from '@/types/testOptions'

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
  } = useForm<z.infer<typeof ThinkTimeSchema>>({
    resolver: zodResolver(ThinkTimeSchema),
    defaultValues: {
      sleepType,
      timing,
    },
    mode: 'onChange',
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
      setValue('timing', { type: 'fixed', value: null })
    }
    if (type === 'range') {
      setValue('timing', { type: 'range', value: { min: null, max: null } })
    }
  }

  return (
    <Container align="left" size="4" p="2">
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup name="timing.type" label="Configure timing" errors={errors}>
          <Flex direction="column">
            <Controller
              name="timing.type"
              control={control}
              render={({ field }) => (
                <Select.Root
                  size="2"
                  onValueChange={(value) => {
                    field.onChange(value)
                    handleTypeChange(value)
                  }}
                  value={field.value}
                >
                  <Select.Trigger onBlur={field.onBlur} />
                  <Select.Content>
                    <Select.Item value="fixed">Fixed</Select.Item>
                    <Select.Item value="range">Range</Select.Item>
                  </Select.Content>
                </Select.Root>
              )}
            />
          </Flex>
        </FieldGroup>

        {data.timing.type === 'fixed' && (
          <FieldGroup
            name="timing.value"
            label="Time in seconds"
            errors={errors}
          >
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
                  {...register('timing.value.min', {
                    setValueAs: stringAsNullableNumber,
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
                  {...register('timing.value.max', {
                    setValueAs: stringAsNullableNumber,
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
          <Flex direction="column">
            <Controller
              name="sleepType"
              control={control}
              render={({ field }) => (
                <Select.Root
                  size="2"
                  defaultValue="groups"
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <Select.Trigger />
                  <Select.Content>
                    <Select.Item value="groups">Between Groups</Select.Item>
                    <Select.Item value="requests">Between Requests</Select.Item>
                    <Select.Item value="iterations">
                      End of iteration
                    </Select.Item>
                  </Select.Content>
                </Select.Root>
              )}
            />
          </Flex>
        </FieldGroup>

        {data.sleepType === 'requests' && (
          <Callout.Root color="amber" role="alert" variant="surface">
            <Callout.Icon>
              <InfoCircledIcon />
            </Callout.Icon>
            <Callout.Text wrap="balance">
              It is advisable not to use this option if you have included
              groups, as it may cause unexpected delays between requests, even
              within a group.
            </Callout.Text>
          </Callout.Root>
        )}
      </form>
    </Container>
  )
}

function stringAsNullableNumber(value: string) {
  return value ? parseFloat(value) : null
}

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <Text color="red" size="1">
      {children}
    </Text>
  )
}

function FieldGroup({
  children,
  label,
  name,
  errors,
}: {
  children: React.ReactNode
  errors: FieldErrors
  name: string
  label?: string
}) {
  return (
    <Box mb="2">
      {label && <Label.Root htmlFor={name}>{label}</Label.Root>}
      <Box>{children}</Box>
      <ErrorMessage errors={errors} name={name} as={FieldError} />
    </Box>
  )
}
