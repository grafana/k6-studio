import { IconButton, Tooltip } from '@radix-ui/themes'
import { UserRoundIcon } from 'lucide-react'

import { Avatar } from '@/components/Profile/Avatar'
import { AuthStatus } from '@/handlers/auth/types'
import { StackInfo } from '@/schemas/profile'
import { getDisplayName } from '@/utils/displayName'
import { exhaustive } from '@/utils/typescript'

interface ProfileButtonProps {
  status: AuthStatus
  onClick: () => void
}

export function ProfileButton({ status, onClick }: ProfileButtonProps) {
  switch (status.type) {
    case 'signed-out':
      return <SignedOutButton onClick={onClick} />
    case 'signed-in':
      return <SignedInButton stack={status.stack} onClick={onClick} />
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

function SignedOutButton({ onClick }: { onClick: () => void }) {
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
}

function SignedInButton({
  stack,
  onClick,
}: {
  stack: StackInfo
  onClick: () => void
}) {
  const label = `${getDisplayName(stack.user)} (${stack.name})`

  return (
    <ButtonShell label={label} onClick={onClick}>
      <Avatar user={stack.user} size={30} />
    </ButtonShell>
  )
}
