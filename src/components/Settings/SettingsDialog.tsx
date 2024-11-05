import { css } from '@emotion/react'
import { Button, Dialog, Flex, Tabs } from '@radix-ui/themes'
import { ProxySettings } from './ProxySettings'
import { FormProvider, useForm } from 'react-hook-form'
import { AppSettingsSchema } from '@/schemas/appSettings'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { RecorderSettings } from './RecorderSettings'
import { AppSettings } from '@/types/settings'
import { UsageReportSettings } from './UsageReportSettings'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { ButtonWithTooltip } from '../ButtonWithTooltip'
import { findIndex, sortBy } from 'lodash-es'

type SettingsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const tabs = [
  { label: 'Proxy', value: 'proxy', component: ProxySettings },
  { label: 'Recorder', value: 'recorder', component: RecorderSettings },
  {
    label: 'Usage Collection',
    value: 'usageReport',
    component: UsageReportSettings,
  },
]

export const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const [settings, setSettings] = useState<AppSettings>()
  const [submitting, setSubmitting] = useState(false)
  const [selectedTab, setSelectedTab] = useState('proxy')

  useEffect(() => {
    async function fetchSettings() {
      const data = await window.studio.settings.getSettings()
      setSettings(data)
    }
    fetchSettings()
  }, [])

  const formMethods = useForm<AppSettings>({
    resolver: zodResolver(AppSettingsSchema),
    shouldFocusError: true,
    values: settings,
  })

  const {
    handleSubmit,
    reset,
    formState: { isDirty, errors },
  } = formMethods

  const onSubmit = async (data: AppSettings) => {
    try {
      setSubmitting(true)
      const isSuccess = await window.studio.settings.saveSettings(data)
      if (isSuccess) {
        reset(data)
        setSettings(data)
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Error saving settings', error)
    } finally {
      setSubmitting(false)
    }
  }

  const onInvalid = (errors: Record<string, unknown>) => {
    // Sort tabs by the order they appear in the UI
    const tabsWithError = sortBy(Object.keys(errors), (key) =>
      findIndex(tabs, { value: key })
    )
    setSelectedTab(tabsWithError[0] || 'proxy')
  }

  const handleOpenChange = () => {
    reset(settings)
    onOpenChange(!open)
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
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
          <Tabs.Root
            value={selectedTab}
            onValueChange={(value) => setSelectedTab(value)}
          >
            <Tabs.List>
              {tabs.map((tab) => (
                <Tabs.Trigger key={tab.value} value={tab.value}>
                  {tab.label}
                  {errors[tab.value as keyof typeof errors] && (
                    <ExclamationTriangleIcon
                      css={css`
                        margin-left: var(--space-1);
                      `}
                    />
                  )}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            {tabs.map((tab) => (
              <Tabs.Content key={tab.value} value={tab.value}>
                <tab.component />
              </Tabs.Content>
            ))}
          </Tabs.Root>

          <Flex gap="3" justify="end" align="end" flexGrow="1">
            <Dialog.Close>
              <Button variant="outline">Cancel</Button>
            </Dialog.Close>
            <Dialog.Close>
              <ButtonWithTooltip
                loading={submitting}
                disabled={!isDirty}
                tooltip={!isDirty ? 'Changes saved' : ''}
                onClick={handleSubmit(onSubmit, onInvalid)}
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
