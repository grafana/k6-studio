import { IconButton, Tooltip } from '@radix-ui/themes'
import { UserRoundIcon } from 'lucide-react'

import { Avatar } from '@/components/Profile/Avatar'
import { AuthStatus } from '@/handlers/auth/types'
import { getDisplayName } from '@/utils/displayName'
import { exhaustive } from '@/utils/typescript'

interface ProfileButtonProps {
  status: AuthStatus
  onClick: () => void
}

export function ProfileButton({ status, onClick }: ProfileButtonProps) {
  switch (status.type) {
    case 'signed-out':
      return (
        <ButtonShell label="Sign in to Grafana Cloud" onClick={onClick}>
          <span
            css={{
              width: 27,
              height: 27,
              borderRadius: '50%',
              border: '1.5px dashed var(--gray-8)',
              background: 'var(--gray-2)',
              color: 'var(--gray-9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <UserRoundIcon size={16} />
          </span>
        </ButtonShell>
      )
    case 'signed-in': {
      const label = `${getDisplayName(status.stack.user)} (${status.stack.name})`
      return (
        <ButtonShell label={label} onClick={onClick}>
          <Avatar user={status.stack.user} size={30} />
        </ButtonShell>
      )
    }
    default:
      return exhaustive(status)
  }
}

function ButtonShell({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Tooltip content={label} side="right">
      <IconButton
        aria-label={label}
        variant="ghost"
        color="gray"
        onClick={onClick}
        css={{ fontSize: 24 }}
      >
        {children}
      </IconButton>
    </Tooltip>
  )
}
