import { AppSettings } from '@/types/settings'
import { Flex, Text, Checkbox } from '@radix-ui/themes'
import { Controller, useFormContext } from 'react-hook-form'
import { SettingsSection } from './SettingsSection'
import { FileUploadInput } from '../Form'
import { useEffect } from 'react'

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

  useEffect(() => {
    if (recorder.detectBrowserPath) {
      setValue('recorder.browserPath', '', { shouldDirty: true })
      clearErrors('recorder.browserPath')
    }
  }, [clearErrors, recorder.detectBrowserPath, setValue])

  const handleSelectFile = async () => {
    const result = await window.studio.settings.selectBrowserExecutable()
    const { canceled, filePaths } = result
    if (canceled || !filePaths.length) return
    setValue('recorder.browserPath', filePaths[0], { shouldDirty: true })
    clearErrors('recorder.browserPath')
  }

  return (
    <SettingsSection>
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

      <FileUploadInput
        label="Browser Path"
        errors={errors}
        name="recorder.browserPath"
        onSelectFile={handleSelectFile}
        buttonText="Select executable"
        hint="The location of the browser executable (k6 Studio currently supports Chrome)"
        disabled={recorder.detectBrowserPath}
      />
    </SettingsSection>
  )
}
