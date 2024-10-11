import { FieldGroup, ControlledSelect } from '@/components/Form'
import { AppSettings } from '@/schemas/appSettings'
import { ProxyStatus } from '@/types'
import { stringAsNumber } from '@/utils/form'
import { css } from '@emotion/react'
import { Flex, Text, Box, Heading, TextField, Checkbox } from '@radix-ui/themes'
import { useEffect, useState } from 'react'
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
  const [proxyStatus, setProxyStatus] = useState<ProxyStatus>()

  const { proxy } = watch()

  useEffect(() => {
    async function fetchProxyStatus() {
      const status = await window.studio.proxy.getProxyStatus()
      setProxyStatus(status)
    }
    fetchProxyStatus()

    return window.studio.proxy.onProxyStatusChange((status) =>
      setProxyStatus(status)
    )
  }, [])

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
        Proxy settings
      </Heading>

      <Box mx="2">
        <FieldGroup
          name="proxy.port"
          label="Port number"
          errors={errors}
          hint="The port number k6 Studio proxy should listen to on this machine (between 1 and 65535)"
        >
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

        <FieldGroup label="Proxy mode" name="proxy.mode" errors={errors}>
          <ControlledSelect
            control={control}
            name="proxy.mode"
            options={modeOptions}
          />
        </FieldGroup>

        {proxy && proxy.mode === 'upstream' && (
          <>
            <FieldGroup
              name="proxy.upstream.url"
              label="Server URL"
              errors={errors}
            >
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
        )}

        <Flex gap="2" mt="5">
          <Text size="2">
            Proxy status: <ProxyStatusIndicator status={proxyStatus} />
          </Text>
        </Flex>
      </Box>
    </Flex>
  )
}

function ProxyStatusIndicator({ status }: { status?: ProxyStatus }) {
  const statusColorMap: Record<ProxyStatus, string> = {
    ['online']: 'var(--green-9)',
    ['offline']: 'var(--gray-9)',
    ['restarting']: 'var(--blue-9)',
  }
  const backgroundColor = status ? statusColorMap[status] : '#fff'

  return (
    <Text
      size="2"
      css={css`
        background-color: ${backgroundColor};
        border-radius: 4px;
        color: #fff;
        padding: var(--space-1) var(--space-2);
      `}
    >
      {status}
    </Text>
  )
}
