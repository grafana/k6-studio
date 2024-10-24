import { FieldGroup } from '@/components/Form'
import { stringAsNumber } from '@/utils/form'
import { Flex, Text, TextField, Checkbox } from '@radix-ui/themes'
import { Controller, useFormContext } from 'react-hook-form'
import { UpstreamProxySettings } from './UpstreamProxySettings'
import { SettingsSection } from './SettingsSection'
import { ControlledRadioGroup } from '@/components/Form/ControllerRadioGroup'
import { AppSettings } from '@/types/settings'

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
          name="proxy.automaticallyFindPort"
          render={({ field }) => (
            <Text size="2" as="label">
              <Checkbox
                {...register('proxy.automaticallyFindPort')}
                checked={field.value}
                onCheckedChange={field.onChange}
              />{' '}
              Allow k6 Studio to find an available port if this port is in use
            </Text>
          )}
        />
      </Flex>

      <FieldGroup
        label="Proxy mode"
        name="proxy.mode"
        errors={errors}
        hint="How k6 Studio proxy should handle requests"
        hintType="text"
      >
        <ControlledRadioGroup
          control={control}
          name="proxy.mode"
          options={modeOptions}
        />
      </FieldGroup>

      {proxy && proxy.mode === 'upstream' && <UpstreamProxySettings />}
    </SettingsSection>
  )
}
