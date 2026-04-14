import { css } from '@emotion/react'
import { Flex, IconButton } from '@radix-ui/themes'
import { PanelLeftCloseIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface SidebarHeaderProps {
  icon: ReactNode
  title: string
  variant?: 'primary' | 'secondary'
  actions?: ReactNode
  onCollapseSidebar: () => void
}

export function SidebarHeader({
  icon,
  title,
  actions,
  variant = 'primary',
  onCollapseSidebar,
}: SidebarHeaderProps) {
  return (
    <Flex
      align="center"
      p="3"
      gap="2"
      css={css`
        font-size: var(--font-size-1);
        font-weight: 600;
        text-transform: uppercase;
        color: ${variant === 'primary' ? 'var(--gray-12)' : 'var(--gray-11)'};
      `}
    >
      {icon}
      {title}
      <Flex align="center" gap="2" ml="auto">
        {actions}
        {variant === 'primary' && (
          <IconButton
            size="1"
            variant="ghost"
            color="gray"
            onClick={onCollapseSidebar}
          >
            <PanelLeftCloseIcon />
          </IconButton>
        )}
      </Flex>
    </Flex>
  )
}
