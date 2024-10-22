import { Flex, Text, Checkbox, Link } from '@radix-ui/themes'
import { Controller, useFormContext } from 'react-hook-form'
import { SettingsSection } from './SettingsSection'
import { AppSettings } from '@/types/settings'

export const TelemetrySettings = () => {
  const { control, register } = useFormContext<AppSettings>()

  const handleLinkClick = () => {
    window.studio.browser.openExternalLink(
      'https://github.com/grafana/k6-studio/blob/main/README.md#telemetry'
    )
  }

  return (
    <SettingsSection title="Telemetry">
      <Flex gap="2">
        <Controller
          control={control}
          name="telemetry.enabled"
          render={({ field }) => (
            <Text size="2" as="label">
              <Checkbox
                {...register('telemetry.enabled')}
                defaultChecked
                checked={field.value}
                onCheckedChange={field.onChange}
              />{' '}
              I consent to the anonymous collection and use of telemetry data to
              improve k6 Studio.{' '}
              <Link href="" onClick={handleLinkClick}>
                Learn more.
              </Link>
            </Text>
          )}
        />
      </Flex>
    </SettingsSection>
  )
}
