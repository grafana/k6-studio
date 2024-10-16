import { View } from '@/components/Layout/View'
import { Button, ScrollArea } from '@radix-ui/themes'
import { ProxySettings } from './ProxySettings'
import { FormProvider, useForm } from 'react-hook-form'
import { AppSettings, AppSettingsSchema } from '@/schemas/appSettings'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRoutePath } from '@/routeMap'
import { ButtonWithTooltip } from '@/components/ButtonWithTooltip'
import { RecorderSettings } from './RecorderSettings'

export const Settings = () => {
  const navigate = useNavigate()
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
    } catch (error) {
      console.error('Error saving settings', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelClick = () => {
    navigate(getRoutePath('home'))
  }

  return (
    <View
      title="Settings"
      actions={
        <>
          <Button onClick={handleCancelClick} variant="outline">
            Cancel
          </Button>
          <ButtonWithTooltip
            loading={submitting}
            disabled={!isDirty}
            tooltip={!isDirty ? 'Changes saved' : ''}
            onClick={handleSubmit(onSubmit)}
          >
            Save settings
          </ButtonWithTooltip>
        </>
      }
    >
      <ScrollArea>
        <FormProvider {...formMethods}>
          <RecorderSettings />
          <ProxySettings />
        </FormProvider>
      </ScrollArea>
    </View>
  )
}
