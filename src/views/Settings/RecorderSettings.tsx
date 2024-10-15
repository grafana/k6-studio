import { FieldGroup } from '@/components/Form'
import { AppSettings } from '@/schemas/appSettings'
import { Flex, Text, TextField, Checkbox } from '@radix-ui/themes'
import { Controller, useFormContext } from 'react-hook-form'
import { SettingsSection } from './SettingsSection'

export const RecorderSettings = () => {
  const {
    formState: { errors },
    control,
    register,
    watch,
  } = useFormContext<AppSettings>()

  const { recorder } = watch()

  return (
    <SettingsSection title="Recorder">
      <Flex gap="2" mb="4">
        <Controller
          control={control}
          name="recorder.detectBrowserPath"
          render={({ field }) => (
            <Text size="2" as="label">
              <Checkbox
                {...register('recorder.detectBrowserPath')}
                checked={field.value}
                onCheckedChange={field.onChange}
              />{' '}
              Automatically detect browser
            </Text>
          )}
        />
      </Flex>

      {recorder && !recorder.detectBrowserPath && (
        <>
          <FieldGroup
            name="recorder.browserPath"
            label="Browser Path"
            errors={errors}
            hint="The location of the browser executable (k6 Studio currently supports Chrome)"
          >
            <TextField.Root type="text" {...register('recorder.browserPath')} />
          </FieldGroup>
        </>
      )}
    </SettingsSection>
  )
}
