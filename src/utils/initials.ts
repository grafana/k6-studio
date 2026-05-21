import { UserInfo } from '@/schemas/profile'

export function getInitials(user: UserInfo): string {
  const parts = (user.name ?? '').trim().split(/\s+/).filter(Boolean)

  if (parts.length >= 2) {
    const first = parts[0] ?? ''
    const last = parts.at(-1) ?? ''
    return (first.charAt(0) + last.charAt(0)).toUpperCase()
  }

  if (parts.length === 1) {
    return (parts[0] ?? '').charAt(0).toUpperCase()
  }

  if (user.username && user.username.length > 0) {
    return user.username.charAt(0).toUpperCase()
  }

  const localPart = user.email.split('@')[0] ?? ''
  return localPart.length > 0 ? localPart.charAt(0).toUpperCase() : '?'
}
