import { css } from '@emotion/react'
import { Box, Flex, IconButton, Text } from '@radix-ui/themes'
import { PanelLeftCloseIcon } from 'lucide-react'
import { ReactNode } from 'react'

export interface SidebarViewLayoutProps {
  icon: ReactNode
  heading: ReactNode
  actions?: ReactNode
  children: ReactNode
  onCollapseSidebar: () => void
}

export function SidebarViewLayout({
  icon,
  heading,
  actions,
  onCollapseSidebar,
  children,
}: SidebarViewLayoutProps) {
  return (
    <Flex
      direction="column"
      height="100%"
      css={css`
        flex: 1 1 0;
        min-height: 0;
      `}
    >
      <Flex
        align="center"
        gap="2"
        px="3"
        py="4"
        css={css`
          flex-shrink: 0;
          border-bottom: 1px solid var(--gray-5);
          text-transform: uppercase;
        `}
      >
        <Flex
          align="center"
          gap="2"
          css={css`
            flex: 1 1 0;
            min-width: 0;
          `}
        >
          <Box
            css={css`
              display: flex;
              flex-shrink: 0;
              color: var(--gray-11);

              .lucide {
                width: 16px;
                height: 16px;
              }
            `}
          >
            {icon}
          </Box>
          <Text
            as="div"
            size="2"
            weight="bold"
            css={css`
              font-size: var(--font-size-1);
              color: var(--foreground);
              letter-spacing: 0.1em;
              line-height: 1.2;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            `}
          >
            {heading}
          </Text>
        </Flex>
        <Flex
          align="center"
          gap="1"
          justify="end"
          css={css`
            flex-shrink: 0;
          `}
        >
          {actions}
          <IconButton
            size="1"
            variant="ghost"
            color="gray"
            aria-label="Collapse sidebar"
            onClick={onCollapseSidebar}
          >
            <PanelLeftCloseIcon />
          </IconButton>
        </Flex>
      </Flex>
      <Box
        css={css`
          flex: 1 1 0;
          min-height: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        `}
      >
        {children}
      </Box>
    </Flex>
  )
}
