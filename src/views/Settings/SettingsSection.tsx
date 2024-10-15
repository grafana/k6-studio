import { css } from '@emotion/react'
import { Flex, Heading, Box } from '@radix-ui/themes'

type SettingsSectionProps = {
  title: string
  children: React.ReactNode
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <Flex gap="2" direction="column" px="3">
      <Heading
        size="2"
        mt="4"
        css={css`
          font-size: 18px;
          line-height: 24px;
          font-weight: 500;
          padding: var(--space-2);
        `}
      >
        {title}
      </Heading>

      <Box mx="2">{children}</Box>
    </Flex>
  )
}
