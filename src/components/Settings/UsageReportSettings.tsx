import { Flex, Text, Checkbox, Link } from '@radix-ui/themes'
import { Controller, useFormContext } from 'react-hook-form'
import { SettingsSection } from './SettingsSection'
import { AppSettings } from '@/types/settings'

export const UsageReportSettings = () => {
  const { control, register } = useFormContext<AppSettings>()

  const handleLinkClick = () =>
    window.studio.browser.openExternalLink(
      'https://grafana.com/docs/k6-studio/set-up/usage-collection/'
    )

  return (
    <SettingsSection>
      <Flex gap="2">
        <Controller
          control={control}
          name="usageReport.enabled"
          render={({ field }) => (
            <Text size="2" as="label">
              <Checkbox
                {...register('usageReport.enabled')}
                checked={field.value}
                onCheckedChange={field.onChange}
              />{' '}
              Send my anonymous usage data to Grafana to aid in development of
              k6 Studio.{' '}
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
