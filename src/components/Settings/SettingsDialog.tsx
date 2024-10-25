import { css } from '@emotion/react'
import { Box, Button, Dialog, Flex, ScrollArea } from '@radix-ui/themes'
import { ProxySettings } from './ProxySettings'
import { FormProvider, useForm } from 'react-hook-form'
import { AppSettingsSchema } from '@/schemas/appSettings'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { ButtonWithTooltip } from '@/components/ButtonWithTooltip'
import { RecorderSettings } from './RecorderSettings'
import { AppSettings } from '@/types/settings'
import { UsageReportSettings } from './UsageReportSettings'

type SettingsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const [settings, setSettings] = useState<AppSettings>()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchSettings() {
      const data = await window.studio.settings.getSettings()
      setSettings(data)
    }
    fetchSettings()
  }, [])

  const formMethods = useForm<AppSettings>({
    resolver: zodResolver(AppSettingsSchema),
    shouldFocusError: false,
    values: settings,
  })

  const {
    formState: { isDirty },
    handleSubmit,
    reset,
  } = formMethods

  const onSubmit = async (data: AppSettings) => {
    try {
      setSubmitting(true)
      const isSuccess = await window.studio.settings.saveSettings(data)
      isSuccess && reset(data)
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving settings', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        maxWidth="800px"
        maxHeight="640px"
        width="calc(100vw - 100px)"
        height="calc(100vh - 100px)"
        css={css`
          overflow: hidden;
          display: flex;
          flex-direction: column;
        `}
      >
        <Dialog.Title>Settings</Dialog.Title>
        <FormProvider {...formMethods}>
          <Box pb="4" minHeight="0">
            <ScrollArea>
              <RecorderSettings />
              <ProxySettings />
              <UsageReportSettings />
            </ScrollArea>
          </Box>

          <Flex gap="3" justify="end">
            <Dialog.Close>
              <Button variant="outline">Cancel</Button>
            </Dialog.Close>
            <Dialog.Close>
              <ButtonWithTooltip
                loading={submitting}
                disabled={!isDirty}
                tooltip={!isDirty ? 'Changes saved' : ''}
                onClick={handleSubmit(onSubmit)}
              >
                Save changes
              </ButtonWithTooltip>
            </Dialog.Close>
          </Flex>
        </FormProvider>
      </Dialog.Content>
    </Dialog.Root>
  )
}
