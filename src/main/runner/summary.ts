import type { Check } from '@/schemas/k6'

interface Group {
  checks: Check[]
  groups: Group[]
}

export function handleSummary(data: { root_group: Group }) {
  const checks: Check[] = []

  function traverseGroup(group: Group) {
    if (group.checks) {
      group.checks.forEach((check) => {
        checks.push(check)
      })
    }
    if (group.groups) {
      group.groups.forEach((subGroup) => {
        traverseGroup(subGroup)
      })
    }
  }

  traverseGroup(data.root_group)

  return {
    stdout: JSON.stringify(checks),
  }
}
