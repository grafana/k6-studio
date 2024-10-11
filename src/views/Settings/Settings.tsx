import { View } from '@/components/Layout/View'
import { Button } from '@radix-ui/themes'
import { ProxySettings } from './ProxySettings'
import { FormProvider, useForm } from 'react-hook-form'
import { AppSettings, AppSettingsSchema } from '@/schemas/appSettings'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRoutePath } from '@/routeMap'

export const Settings = () => {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<AppSettings>()

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

  const onSubmit = async (data: AppSettings) => {
    window.studio.settings.saveSettings(data)
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
          <Button onClick={formMethods.handleSubmit(onSubmit)}>Save</Button>
        </>
      }
    >
      <FormProvider {...formMethods}>
        <ProxySettings />
      </FormProvider>
    </View>
  )
}
