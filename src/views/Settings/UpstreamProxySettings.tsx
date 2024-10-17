import { FieldGroup } from '@/components/Form'
import { AppSettings } from '@/types/settings'
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
      <FieldGroup
        name="proxy.url"
        label="Server URL"
        errors={errors}
        hint="Where k6 Studio should forward requests to"
        hintType="text"
      >
        <TextField.Root
          placeholder="http://example.com:6000"
          {...register('proxy.url')}
        />
      </FieldGroup>

      <Flex gap="2" my="4">
        <Controller
          control={control}
          defaultValue={false}
          name="proxy.requiresAuth"
          render={({ field }) => (
            <Text size="2" as="label">
              <Checkbox
                {...register('proxy.requiresAuth')}
                checked={field.value}
                onCheckedChange={field.onChange}
              />{' '}
              Require authentication
            </Text>
          )}
        />
      </Flex>

      {proxy && proxy.mode === 'upstream' && proxy.requiresAuth && (
        <>
          <FieldGroup
            name="proxy.username"
            label="Username"
            errors={errors}
            hint="Username required to authenticate with the upstream server"
            hintType="text"
          >
            <TextField.Root
              placeholder="username"
              {...register('proxy.username')}
            />
          </FieldGroup>

          <FieldGroup
            name="proxy.password"
            label="Password"
            errors={errors}
            hint="Password required to authenticate with the upstream server"
            hintType="text"
          >
            <TextField.Root
              placeholder="password"
              type="password"
              {...register('proxy.password')}
            />
          </FieldGroup>
        </>
      )}
    </>
  )
}
