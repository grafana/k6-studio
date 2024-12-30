import { css } from '@emotion/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Button, Dialog, Flex, ScrollArea, Tabs } from '@radix-ui/themes'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { findIndex, sortBy } from 'lodash-es'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { ProxySettings } from './ProxySettings'
import { AppSettingsSchema } from '@/schemas/settings'
import { RecorderSettings } from './RecorderSettings'
import { AppSettings } from '@/types/settings'
import { TelemetrySettings } from './TelemetrySettings'
import { ButtonWithTooltip } from '../ButtonWithTooltip'
import { AppearanceSettings } from './AppearanceSettings'
import { LogsSettings } from './LogsSettings'
import { useSaveSettings, useSettings } from './Settings.hooks'

type SettingsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const tabs = [
  { label: 'Proxy', value: 'proxy', component: ProxySettings },
  { label: 'Recorder', value: 'recorder', component: RecorderSettings },
  {
    label: 'Telemetry',
    value: 'usageReport',
    component: TelemetrySettings,
  },
  {
    label: 'Appearance',
    value: 'appearance',
    component: AppearanceSettings,
  },
  {
    label: 'Logs',
    value: 'logs',
    component: LogsSettings,
  },
]

export const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const { data: settings } = useSettings()
  const { mutateAsync: saveSettings, isPending } = useSaveSettings(() => {
    onOpenChange(false)
  })
  const [selectedTab, setSelectedTab] = useState('proxy')

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

  const onInvalid = (errors: Record<string, unknown>) => {
    // Sort tabs by the order they appear in the UI
    const tabsWithError = sortBy(Object.keys(errors), (key) =>
      findIndex(tabs, { value: key })
    )
    setSelectedTab(tabsWithError[0] || 'proxy')
  }

  const handleOpenChange = () => {
    reset(settings)
    setSelectedTab('proxy')
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
            css={css`
              height: 100%;
              display: flex;
              flex-direction: column;
            `}
          >
            <Box flexShrink="0">
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
            </Box>

            <Box minHeight="0" maxHeight="460px" mb="4" flexGrow="1">
              <ScrollArea>
                {tabs.map((tab) => (
                  <Tabs.Content
                    key={tab.value}
                    value={tab.value}
                    css={css`
                      height: 100%;
                    `}
                  >
                    <tab.component />
                  </Tabs.Content>
                ))}
              </ScrollArea>
            </Box>

            <Flex gap="3" justify="end">
              <Dialog.Close>
                <Button variant="outline">Cancel</Button>
              </Dialog.Close>
              <Dialog.Close>
                <ButtonWithTooltip
                  loading={isPending}
                  disabled={!isDirty}
                  tooltip={!isDirty ? 'Changes saved' : ''}
                  onClick={handleSubmit(
                    (data) => saveSettings(data),
                    onInvalid
                  )}
                >
                  Save changes
                </ButtonWithTooltip>
              </Dialog.Close>
            </Flex>
          </Tabs.Root>
        </FormProvider>
      </Dialog.Content>
    </Dialog.Root>
  )
}
