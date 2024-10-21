import { Box, Button, Dialog, Flex, ScrollArea } from '@radix-ui/themes'
import { ProxySettings } from './ProxySettings'
import { FormProvider, useForm } from 'react-hook-form'
import { AppSettingsSchema } from '@/schemas/appSettings'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { ButtonWithTooltip } from '@/components/ButtonWithTooltip'
import { RecorderSettings } from './RecorderSettings'
import { AppSettings } from '@/types/settings'

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

  const handleCancelClick = () => {
    reset(settings)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        maxWidth="100%"
        width="800px"
        style={{ overflow: 'hidden' }}
      >
        <Dialog.Title>Settings</Dialog.Title>
        <FormProvider {...formMethods}>
          <Box style={{ height: 600, paddingBottom: 'var(--space-4)' }}>
            <ScrollArea>
              <RecorderSettings />
              <ProxySettings />
            </ScrollArea>
          </Box>

          <Flex gap="3" justify="end">
            <Dialog.Close>
              <Button variant="outline" onClick={handleCancelClick}>
                Cancel
              </Button>
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
