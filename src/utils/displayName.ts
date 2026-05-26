import { UserInfo } from '@/schemas/profile'

function pickNonEmpty(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function getDisplayName(user: UserInfo): string {
  return pickNonEmpty(user.name) ?? pickNonEmpty(user.username) ?? user.email
}
