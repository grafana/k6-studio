export function handleSummary(data) {
  const checks = []

  function traverseGroup(group) {
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
