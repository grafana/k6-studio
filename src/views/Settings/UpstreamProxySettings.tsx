import { FieldGroup } from '@/components/Form'
import { AppSettings } from '@/schemas/appSettings'
import { TextField, Flex, Checkbox, Text } from '@radix-ui/themes'
import { Controller, useFormContext } from 'react-hook-form'

export function UpstreamProxySettings() {
  const {
    watch,
    control,
    register,
    formState: { errors },
  } = useFormContext<AppSettings>()

  const { proxy } = watch()

  return (
    <>
      <FieldGroup name="proxy.upstream.url" label="Server URL" errors={errors}>
        <TextField.Root
          placeholder="http://example.com:6000"
          {...register('proxy.upstream.url')}
        />
      </FieldGroup>

      <Flex gap="2" my="4">
        <Controller
          control={control}
          name="proxy.upstream.requireAuth"
          render={({ field }) => (
            <Text size="2" as="label">
              <Checkbox
                {...register('proxy.upstream.requireAuth')}
                checked={field.value}
                onCheckedChange={field.onChange}
              />{' '}
              Require authentication
            </Text>
          )}
        />
      </Flex>

      {proxy && proxy.upstream.requireAuth && (
        <>
          <FieldGroup
            name="proxy.upstream.username"
            label="Username"
            errors={errors}
          >
            <TextField.Root
              placeholder="username"
              {...register('proxy.upstream.username')}
            />
          </FieldGroup>

          <FieldGroup
            name="proxy.upstream.password"
            label="Password"
            errors={errors}
          >
            <TextField.Root
              placeholder="password"
              type="password"
              {...register('proxy.upstream.password')}
            />
          </FieldGroup>
        </>
      )}
    </>
  )
}
