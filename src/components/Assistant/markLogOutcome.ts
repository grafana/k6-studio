import { ActionLogEntry } from './types'

export function markLogOutcome(
  entries: ActionLogEntry[],
  type: 'outcome-success' | 'outcome-partial' | 'outcome-failure'
): ActionLogEntry[] {
  const target = entries.findLast(
    (entry) => entry.type === 'reasoning' && entry.text?.trim()
  )

  if (!target) {
    return entries
  }

  return entries.map((entry) =>
    entry.id === target.id ? { ...entry, type } : entry
  )
}
