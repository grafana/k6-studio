import { Flex } from '@radix-ui/themes'

type SettingsSectionProps = {
  children: React.ReactNode
}

export function SettingsSection({ children }: SettingsSectionProps) {
  return (
    <Flex direction="column" pt="4" p="1" height="100%">
      {children}
    </Flex>
  )
}
