import { Flex, Text, Checkbox, Callout, RadioGroup } from '@radix-ui/themes'
import { AlertTriangleIcon } from 'lucide-react'
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
      'org.chromium.chromium',
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
          <Callout.Root color="amber" mb="4">
            <Callout.Icon>
              <AlertTriangleIcon />
            </Callout.Icon>

            <Callout.Text>
              The selected executable doesn&apos;t appear to be compatible.
              Please select the correct executable for Chrome or Chromium.
            </Callout.Text>
          </Callout.Root>
        )}

      <FieldGroup
        label={
          <Flex align="center" gap="1">
            <span>
              Browser Recording{' '}
              <Text size="1" weight="light">
                (Preview)
              </Text>{' '}
            </span>
          </Flex>
        }
        name="recorder.browserRecording"
        errors={errors}
        hint={
          <>
            k6 Studio can record user interactions using a browser extension or
            the Chrome DevTools Protocol (CDP). Try switching between these
            methods if you encounter issues with one of them.
          </>
        }
        hintType="text"
      >
        <Flex>
          <Controller
            control={control}
            name="recorder.browserRecording"
            render={({ field }) => (
              <>
                <RadioGroup.Root
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <RadioGroup.Item value="extension">
                    Using browser extension
                  </RadioGroup.Item>
                  <RadioGroup.Item value="cdp">
                    Using Chrome DevTools Protocol
                  </RadioGroup.Item>
                  <RadioGroup.Item value="disabled">Disable</RadioGroup.Item>
                </RadioGroup.Root>
              </>
            )}
          />
        </Flex>
      </FieldGroup>
    </SettingsSection>
  )
}
