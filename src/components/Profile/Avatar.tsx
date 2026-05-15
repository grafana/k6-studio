import { UserInfo } from '@/schemas/profile'
import { getInitials } from '@/utils/initials'

interface AvatarProps {
  user: UserInfo
  size?: number
}

export function Avatar({ user, size = 100 }: AvatarProps) {
  const initials = getInitials(user)
  const fontSize = Math.round(size * 0.4)

  return (
    <span
      css={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--orange-9)',
        color: 'white',
        fontSize,
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
    >
      {initials}
    </span>
  )
}
