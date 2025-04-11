import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { Flex, Text, Checkbox, Callout } from '@radix-ui/themes'
import { useEffect } from 'react'
import { Controller, useFormContext } from 'react-hook-form'

import { AppSettings } from '@/types/settings'

import { FieldGroup, FileUploadInput } from '../Form'

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

  const isValidPath = (path?: string) => {
    if (!path) return false
    const validPaths = [
      'chrome.app',
      'chromium.app',
      'chrome.exe',
      'chromium.exe',
      '/chrome',
      '/chromium',
    ]
    return validPaths.some((validPath) => path.includes(validPath))
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
        label="Browser path"
        errors={errors}
        name="recorder.browserPath"
        onSelectFile={handleSelectFile}
        buttonText="Select executable"
        hint="Google Chrome or Chromium needs to be installed on your machine for the recording functionality to work"
        disabled={recorder.detectBrowserPath}
      />
      {!recorder.detectBrowserPath &&
        recorder.browserPath !== '' &&
        !isValidPath(recorder.browserPath?.toLocaleLowerCase()) && (
          <Callout.Root color="amber">
            <Callout.Icon>
              <ExclamationTriangleIcon />
            </Callout.Icon>

            <Callout.Text>
              The selected executable doesn&apos;t appear to be compatible.
              Please select the correct executable for Chrome or Chromium.
            </Callout.Text>
          </Callout.Root>
        )}

      <FieldGroup
        label="Browser recording"
        name="recorder.enableBrowserRecorder"
        errors={errors}
        hint={
          <>
            Enables the <em>experimental</em> browser recording feature. With
            this feature enabled user interactions in the browser are recorded
            alongside network requests. The recorded interactions can be
            exported as a k6 browser script.
          </>
        }
        hintType="text"
      >
        <Flex>
          <Controller
            control={control}
            name="recorder.enableBrowserRecorder"
            render={({ field }) => (
              <Text size="2" as="label">
                <Checkbox
                  {...register('recorder.enableBrowserRecorder')}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />{' '}
                Enable browser recording (experimental)
              </Text>
            )}
          />
        </Flex>
      </FieldGroup>
    </SettingsSection>
  )
}
