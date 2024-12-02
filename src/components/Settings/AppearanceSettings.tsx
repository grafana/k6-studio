import { Controller, useFormContext } from 'react-hook-form'
import { Flex, RadioCards, Text } from '@radix-ui/themes'
import { GearIcon, MoonIcon, SunIcon } from '@radix-ui/react-icons'

import { AppSettings } from '@/types/settings'
import { FieldGroup } from '../Form'
import { SettingsSection } from './SettingsSection'

export function AppearanceSettings() {
  const {
    formState: { errors },
    control,
  } = useFormContext<AppSettings>()

  return (
    <SettingsSection>
      <FieldGroup
        name="general.appearance.theme"
        label="Theme"
        errors={errors}
        hint="Select whether the app should use a light theme, dark theme, or match your system settings."
        hintType="text"
      >
        <Controller
          name="general.appearance.theme"
          control={control}
          render={({ field }) => (
            <RadioCards.Root
              value={field.value}
              onValueChange={field.onChange}
              columns={{ initial: '1', sm: '3' }}
            >
              <RadioCards.Item value="light">
                <Flex width="100%" align="center" gap="2">
                  <SunIcon />
                  <Text>Light</Text>
                </Flex>
              </RadioCards.Item>
              <RadioCards.Item value="dark">
                <Flex width="100%" align="center" gap="2">
                  <MoonIcon />
                  <Text>Dark</Text>
                </Flex>
              </RadioCards.Item>
              <RadioCards.Item value="system">
                <Flex width="100%" align="center" gap="2">
                  <GearIcon />
                  <Text>System</Text>
                </Flex>
              </RadioCards.Item>
            </RadioCards.Root>
          )}
        />
      </FieldGroup>
    </SettingsSection>
  )
}
