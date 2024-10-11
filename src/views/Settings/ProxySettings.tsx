import { FieldGroup, ControlledSelect } from '@/components/Form'
import { AppSettings } from '@/schemas/appSettings'
import { stringAsNumber } from '@/utils/form'
import { css } from '@emotion/react'
import { Flex, Text, Box, Heading, TextField, Checkbox } from '@radix-ui/themes'
import { Controller, useFormContext } from 'react-hook-form'

const modeOptions = [
  { value: 'regular', label: 'Regular' },
  { value: 'upstream', label: 'Upstream' },
]

export const ProxySettings = () => {
  const {
    formState: { errors },
    control,
    register,
    watch,
  } = useFormContext<AppSettings>()

  const { proxy } = watch()

  return (
    <Flex gap="2" direction="column" px="2">
      <Heading
        size="2"
        css={css`
          font-size: 15px;
          line-height: 24px;
          font-weight: 500;
          padding: var(--space-2);
        `}
      >
        Proxy
      </Heading>

      <Box mx="2">
        <FieldGroup label="Proxy mode" name="proxy.mode" errors={errors}>
          <ControlledSelect
            control={control}
            name="proxy.mode"
            options={modeOptions}
          />
        </FieldGroup>

        {proxy && proxy.mode === 'upstream' && (
          <FieldGroup
            name="proxy.upstream"
            label="Upstream server"
            errors={errors}
          >
            <TextField.Root
              placeholder="http://example.com:6000"
              {...register('proxy.upstream')}
            />
          </FieldGroup>
        )}

        <FieldGroup name="proxy.port" label="Port number" errors={errors}>
          <TextField.Root
            placeholder="6000"
            type="number"
            min={1}
            {...register('proxy.port', { setValueAs: stringAsNumber })}
          />
        </FieldGroup>

        <Flex gap="2" my="4">
          <Controller
            control={control}
            name="proxy.findPort"
            render={({ field }) => (
              <Text size="2" as="label">
                <Checkbox
                  {...register('proxy.findPort')}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />{' '}
                Allow k6 Studio to find an available port if this port is in use
              </Text>
            )}
          />
        </Flex>
      </Box>
    </Flex>
  )
}
