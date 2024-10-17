import { css } from '@emotion/react'
import { Flex, Heading, Box } from '@radix-ui/themes'

type SettingsSectionProps = {
  title: string
  children: React.ReactNode
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <Flex gap="2" direction="column" p="1">
      <Heading
        size="2"
        my="4"
        css={css`
          font-size: 18px;
          line-height: 24px;
          font-weight: 500;
        `}
      >
        {title}
      </Heading>

      <Box>{children}</Box>
    </Flex>
  )
}
