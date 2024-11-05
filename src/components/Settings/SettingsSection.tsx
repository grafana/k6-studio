import { Box, Flex } from '@radix-ui/themes'

type SettingsSectionProps = {
  children: React.ReactNode
}

export function SettingsSection({ children }: SettingsSectionProps) {
  return (
    <Flex gap="2" direction="column" pt="4">
      <Box>{children}</Box>
    </Flex>
  )
}
