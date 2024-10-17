import { FieldGroup } from '@/components/Form'
import { AppSettings } from '@/types/settings'
import { Flex, Text, TextField, Checkbox, Button } from '@radix-ui/themes'
import { Controller, useFormContext } from 'react-hook-form'
import { SettingsSection } from './SettingsSection'

export const RecorderSettings = () => {
  const {
    formState: { errors },
    control,
    register,
    watch,
    setValue,
    clearErrors,
  } = useFormContext<AppSettings>()

  const { recorder } = watch()

  const handleSelectFile = async () => {
    const result = await window.studio.settings.selectBrowserExecutable()
    const { canceled, filePaths } = result
    if (canceled || !filePaths.length) return
    setValue('recorder.browserPath', filePaths[0])
    clearErrors('recorder.browserPath')
  }

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
        <Flex>
          <FieldGroup
            flexGrow="1"
            name="recorder.browserPath"
            label="Browser Path"
            errors={errors}
            hint="The location of the browser executable (k6 Studio currently supports Chrome)"
            hintType="text"
          >
            <TextField.Root type="text" {...register('recorder.browserPath')} />
          </FieldGroup>

          <Button
            ml="2"
            onClick={handleSelectFile}
            style={{
              display: 'flex',
              alignSelf: 'center',
              marginTop: errors.recorder ? 12 : 36,
            }}
          >
            Select executable
          </Button>
        </Flex>
      )}
    </SettingsSection>
  )
}
