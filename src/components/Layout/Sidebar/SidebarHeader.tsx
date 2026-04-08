import { css } from '@emotion/react'
import { Flex, IconButton } from '@radix-ui/themes'
import { PanelLeftCloseIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface SidebarHeaderProps {
  icon: ReactNode
  title: string
  actions?: ReactNode
  onCollapseSidebar: () => void
}

export function SidebarHeader({
  icon,
  title,
  actions,
  onCollapseSidebar,
}: SidebarHeaderProps) {
  return (
    <Flex
      align="center"
      p="2"
      gap="2"
      css={css`
        font-size: var(--font-size-1);
        font-weight: 600;
        text-transform: uppercase;
      `}
    >
      {icon}
      {title}
      {actions}
      <IconButton
        size="1"
        variant="ghost"
        color="gray"
        css={css`
          margin-left: auto;
        `}
        onClick={onCollapseSidebar}
      >
        <PanelLeftCloseIcon />
      </IconButton>
    </Flex>
  )
}
