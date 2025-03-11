import { IconButton, Tooltip } from '@radix-ui/themes'
import { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface NavIconButtonProps {
  to?: string
  icon: ReactNode
  tooltip: string
  onClick?: () => void
}

export function NavIconButton({
  to,
  icon,
  tooltip,
  onClick,
}: NavIconButtonProps) {
  return (
    <Tooltip content={tooltip} side="right">
      <IconButton
        aria-label={tooltip}
        variant="ghost"
        color="gray"
        asChild={onClick === undefined}
        onClick={onClick}
      >
        {to ? <Link to={to}>{icon}</Link> : icon}
      </IconButton>
    </Tooltip>
  )
}
