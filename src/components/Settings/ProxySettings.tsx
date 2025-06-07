import { Flex, Text, TextField, Checkbox } from '@radix-ui/themes'
import { Controller, useFormContext } from 'react-hook-form'

import { FieldGroup } from '@/components/Form'
import { ControlledRadioGroup } from '@/components/Form/ControllerRadioGroup'
import { AppSettings } from '@/types/settings'
import { stringAsNumber } from '@/utils/form'

import { SettingsSection } from './SettingsSection'
import { UpstreamProxySettings } from './UpstreamProxySettings'

const modeOptions = [
  {
    value: 'regular',
    label: 'Regular (requests are performed from this computer)',
  },
  {
    value: 'upstream',
    label: 'Upstream (requests are forwarded to an upstream server)',
  },
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
    <SettingsSection>
      <FieldGroup
        name="proxy.port"
        label="Port number"
        errors={errors}
        hint="What port number Grafana k6 Studio proxy should listen to in this computer (between 1 and 65535)"
        hintType="text"
      >
        <TextField.Root
          placeholder="6000"
          type="number"
          min={1}
          {...register('proxy.port', { setValueAs: stringAsNumber })}
        />
      </FieldGroup>

      <Flex mt="2" mb="4">
        <Controller
          control={control}
          name="proxy.automaticallyFindPort"
          render={({ field }) => (
            <Text size="2" as="label">
              <Checkbox
                {...register('proxy.automaticallyFindPort')}
                checked={field.value}
                onCheckedChange={field.onChange}
              />{' '}
              Allow Grafana k6 Studio to find an available port if this port is
              in use
            </Text>
          )}
        />
      </Flex>

      <FieldGroup
        label="Proxy mode"
        name="proxy.mode"
        errors={errors}
        hint="How Grafana k6 Studio proxy should handle requests"
        hintType="text"
      >
        <ControlledRadioGroup
          control={control}
          name="proxy.mode"
          options={modeOptions}
        />
      </FieldGroup>

      {proxy && proxy.mode === 'upstream' && <UpstreamProxySettings />}

      <Flex direction="column" mb="4">
        <Flex mt="2" mb="1">
          <Controller
            control={control}
            name="proxy.sslInsecure"
            render={({ field }) => (
              <Text size="2" as="label">
                <Checkbox
                  {...register('proxy.sslInsecure')}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />{' '}
                Skip SSL/TLS certificate validation
              </Text>
            )}
          />
        </Flex>
        <Text size="1" color="gray">
          Enabling this option leaves connections open to man-in-the-middle
          (MITM) attacks. Use it carefully.
        </Text>
      </Flex>
    </SettingsSection>
  )
}
