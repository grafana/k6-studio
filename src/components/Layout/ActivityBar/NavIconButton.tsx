import { IconButton, Tooltip } from '@radix-ui/themes'
import { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface NavIconButtonProps {
  to?: string
  state?: Record<string, unknown>
  icon: ReactNode
  tooltip: string
  active: boolean
  onClick?: () => void
}

export function NavIconButton({
  to,
  state,
  icon,
  tooltip,
  active,
  onClick,
}: NavIconButtonProps) {
  return (
    <Tooltip content={tooltip} side="right">
      <IconButton
        variant="ghost"
        color={active ? 'orange' : 'gray'}
        asChild={onClick === undefined}
        onClick={onClick}
      >
        {to ? (
          <Link to={to} state={state}>
            {icon}
          </Link>
        ) : (
          icon
        )}
      </IconButton>
    </Tooltip>
  )
}
