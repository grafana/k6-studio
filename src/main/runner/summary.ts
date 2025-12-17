import type { Check } from '@/schemas/k6'

interface Group {
  checks: Check[]
  groups: Group[]
}

export function handleSummary(data: {
  root_group: { checks: Check[]; groups: Group[] }
}) {
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

  data.root_group.checks.forEach((check) => {
    checks.push(check)
  })
  data.root_group.groups.forEach((group) => {
    traverseGroup(group)
  })

  return {
    stdout: JSON.stringify(checks),
  }
}
