import { FieldGroup } from '@/components/Form'
import { AppSettings } from '@/schemas/appSettings'
import { ProxyStatus } from '@/types'
import { stringAsNumber } from '@/utils/form'
import { css } from '@emotion/react'
import { Flex, Text, TextField, Checkbox } from '@radix-ui/themes'
import { useEffect, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { UpstreamProxySettings } from './UpstreamProxySettings'
import { SettingsSection } from './SettingsSection'
import { ControlledRadioGroup } from '@/components/Form/ControllerRadioGroup'

const modeOptions = [
  {
    value: 'regular',
    label: 'Regular (requests are performed from this computer)',
  },
  {
    value: 'upstream',
    label: 'Upstream (requests are forwarded to the upstream server)',
  },
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
    <SettingsSection title="Proxy">
      <FieldGroup
        name="proxy.port"
        label="Port number"
        errors={errors}
        hint="What port number k6 Studio proxy should listen to in this computer (between 1 and 65535)"
        hintType="text"
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
        <ControlledRadioGroup
          control={control}
          name="proxy.mode"
          options={modeOptions}
        />
      </FieldGroup>

      {proxy && proxy.mode === 'upstream' && <UpstreamProxySettings />}

      <Flex gap="2" mt="5">
        <Text size="2">
          Proxy status: <ProxyStatusIndicator status={proxyStatus} />
        </Text>
      </Flex>
    </SettingsSection>
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
