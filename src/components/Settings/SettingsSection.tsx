import { Flex, ScrollArea } from '@radix-ui/themes'

type SettingsSectionProps = {
  children: React.ReactNode
}

export function SettingsSection({ children }: SettingsSectionProps) {
  return (
    <Flex gap="2" direction="column" pt="4" height="460px">
      <ScrollArea>{children}</ScrollArea>
    </Flex>
  )
}
