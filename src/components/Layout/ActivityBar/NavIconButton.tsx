import { css } from '@emotion/react'
import { IconButton, Tooltip } from '@radix-ui/themes'
import { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface NavIconButtonProps {
  to?: string
  tooltip: string
  active?: boolean
  children: ReactNode
  onClick?: () => void
}

export function NavIconButton({
  to,
  tooltip,
  active,
  children,
  onClick,
}: NavIconButtonProps) {
  return (
    <Tooltip content={tooltip} side="right">
      <IconButton
        asChild={to !== undefined}
        css={css`
          color: var(--gray-9);

          &[data-active='true'] {
            background-color: var(--accent-a3);
            color: var(--accent-9);
          }

          svg.lucide {
            padding: 8px;
            width: 24px;
            height: 24px;
          }
        `}
        data-active={active}
        aria-label={tooltip}
        variant="ghost"
        onClick={onClick}
      >
        {to !== undefined ? (
          <Link to={to} onClick={onClick}>
            {children}
          </Link>
        ) : (
          children
        )}
      </IconButton>
    </Tooltip>
  )
}
