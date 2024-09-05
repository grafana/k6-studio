export function handleSummary(data) {
  const checks = []
  data.root_group.checks.forEach((check) => {
    checks.push(check)
  })
  data.root_group.groups.forEach((group) => {
    group.checks.forEach((check) => {
      checks.push(check)
    })
  })
  return {
    stdout: JSON.stringify(checks),
  }
}
