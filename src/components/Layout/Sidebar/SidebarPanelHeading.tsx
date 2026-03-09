import { css } from '@emotion/react'
import { Flex, Text, Box } from '@radix-ui/themes'
import { ReactNode } from 'react'

interface SidebarPanelHeadingProps {
  count?: number
  actions?: ReactNode
  children: ReactNode
}

export function SidebarPanelHeading({
  count,
  actions,
  children,
}: SidebarPanelHeadingProps) {
  return (
    <Flex
      css={css`
        box-sizing: border-box;
      `}
      align="center"
      gap="1"
      pl="4"
      pr="2"
      py="1"
      justify="between"
    >
      <Box flexGrow="1">
        <Text
          size="2"
          css={css`
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
          `}
        >
          {children} {count !== undefined && `(${count})`}
        </Text>
      </Box>
      <Flex align="center">{actions}</Flex>
    </Flex>
  )
}
