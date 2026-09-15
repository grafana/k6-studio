import { css } from '@emotion/react'
import { Flex, Text, Checkbox, Callout, TextArea, Code } from '@radix-ui/themes'
import { AlertTriangleIcon } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useFormContext } from 'react-hook-form'

import { FieldGroup } from '@/components/Form'
import { AppSettings } from '@/types/settings'
import { toNativePath } from '@/utils/path'

import { FileUploadInput } from '../Form'

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
    const filePath = filePaths[0]
    if (canceled || !filePath) return
    setValue('recorder.browserPath', toNativePath(filePath), {
      shouldDirty: true,
    })
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

  const hasCustomArgs =
    recorder.chromeLaunchArgs?.some((argument) => argument.trim()) ?? false

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

      <Controller
        control={control}
        name="recorder.chromeLaunchArgs"
        render={({ field }) => (
          <FieldGroup
            name="recorder.chromeLaunchArgs"
            label="Additional Chrome/Chromium arguments"
            errors={errors}
            hint="Enter one Chromium command-line switch per line. Values may contain spaces and do not require shell quotes"
            hintType="text"
          >
            <TextArea
              placeholder="e.g. --user-agent=Custom browser agent"
              rows={4}
              css={css`
                font-family: monospace;
                font-size: var(--font-size-2);
              `}
              value={(field.value ?? []).join('\n')}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
              onChange={(event) => {
                const value = event.target.value
                field.onChange(value === '' ? [] : value.split(/\r?\n/))
              }}
            />
          </FieldGroup>
        )}
      />

      {hasCustomArgs && (
        <Callout.Root color="amber" mb="4">
          <Callout.Icon>
            <AlertTriangleIcon />
          </Callout.Icon>
          <Callout.Text>
            Custom browser arguments may reduce browser security or interfere
            with recording.
            <br />
            k6 Studio managed switches, such as <Code>--proxy-server</Code> and{' '}
            <Code>--user-data-dir</Code>, cannot be overridden
          </Callout.Text>
        </Callout.Root>
      )}
    </SettingsSection>
  )
}
