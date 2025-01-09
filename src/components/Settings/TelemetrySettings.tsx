import { Flex, Text, Checkbox, Link } from '@radix-ui/themes'
import { Controller, useFormContext } from 'react-hook-form'
import { SettingsSection } from './SettingsSection'
import { AppSettings } from '@/types/settings'

export const TelemetrySettings = () => {
  const { control, register } = useFormContext<AppSettings>()

  const handleLinkClick = () =>
    window.studio.browser.openExternalLink(
      'https://grafana.com/docs/k6-studio/set-up/usage-collection/'
    )

  return (
    <SettingsSection>
      <Flex gap="2" mb="4">
        <Text size="2" as="label">
          k6 Studio collects anonymous telemetry data to improve performance and
          user experience.{' '}
          <Link href="" onClick={handleLinkClick}>
            Learn more.
          </Link>
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
