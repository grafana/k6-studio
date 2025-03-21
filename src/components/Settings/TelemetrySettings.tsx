import { Flex, Text, Checkbox } from '@radix-ui/themes'
import { Controller, useFormContext } from 'react-hook-form'

import { AppSettings } from '@/types/settings'

import { ExternalLink } from '../ExternalLink'

import { SettingsSection } from './SettingsSection'

export const TelemetrySettings = () => {
  const { control, register } = useFormContext<AppSettings>()

  return (
    <SettingsSection>
      <Flex gap="2" mb="4">
        <Text size="2" as="label">
          Grafana k6 Studio collects anonymous telemetry data to improve
          performance and user experience.{' '}
          <ExternalLink href="https://grafana.com/docs/k6-studio/set-up/usage-collection/">
            Learn more.
          </ExternalLink>
        </Text>
      </Flex>

      <Flex gap="2" mb="4">
        <Controller
          control={control}
          name="telemetry.usageReport"
          render={({ field }) => (
            <Text size="2" as="label">
              <Checkbox
                {...register('telemetry.usageReport')}
                checked={field.value}
                onCheckedChange={field.onChange}
              />{' '}
              Send usage data to Grafana.
            </Text>
          )}
        />
      </Flex>

      <Flex gap="2">
        <Controller
          control={control}
          name="telemetry.errorReport"
          render={({ field }) => (
            <Text size="2" as="label">
              <Checkbox
                {...register('telemetry.errorReport')}
                checked={field.value}
                onCheckedChange={field.onChange}
              />{' '}
              Send crash reports and error data to Grafana.
            </Text>
          )}
        />
      </Flex>
    </SettingsSection>
  )
}
