import { css } from '@emotion/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Button, Dialog, Flex, ScrollArea, Tabs } from '@radix-ui/themes'
import { findIndex, sortBy } from 'lodash-es'
import { AlertTriangleIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { useSaveSettings, useSettings } from '@/hooks/useSettings'
import { AppSettingsSchema } from '@/schemas/settings'
import { useStudioUIStore } from '@/store/ui'
import { AppSettings } from '@/types/settings'

import { ButtonWithTooltip } from '../ButtonWithTooltip'

import { SettingsTabValue } from './types'
import { useEnabledTabs } from './useEnabledTabs'

export const SettingsDialog = () => {
  const { data: settings } = useSettings()
  const {
    isSettingsDialogOpen: isOpen,
    closeSettingsDialog,
    selectedSettingsTab,
  } = useStudioUIStore((state) => state)
  const { mutateAsync: saveSettings, isPending } = useSaveSettings(() => {
    closeSettingsDialog()
  })
  const [selectedTab, setSelectedTab] = useState(selectedSettingsTab)
  const tabs = useEnabledTabs()

  useEffect(() => {
    setSelectedTab(selectedSettingsTab)
  }, [isOpen, selectedSettingsTab])

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
      findIndex(tabs, { value: key as SettingsTabValue })
    )
    setSelectedTab((tabsWithError[0] as SettingsTabValue) || 'proxy')
  }

  const handleOpenChange = () => {
    reset(settings)
    if (isOpen) {
      closeSettingsDialog()
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
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
            onValueChange={(value) => setSelectedTab(value as SettingsTabValue)}
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
                      <AlertTriangleIcon
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
