import { Check } from '@/schemas/k6'

export function groupChecksByPath(checks: Check[]) {
  const result: Record<string, Check[]> = {
    default: [],
  }

  checks.forEach((item) => {
    const paths = item.path.split('::').filter(Boolean)

    if (paths.length === 1) {
      result['default']?.push(item)
    } else {
      const pathName = paths.slice(0, -1).join('::')

      if (result[pathName]) {
        result[pathName].push(item)
      } else {
        result[pathName] = [item]
      }
    }
  })

  return result
}

export function hasFailures(check: Check) {
  return check.fails > 0
}

export function getPassPercentage(check: Check) {
  const total = check.passes + check.fails
  if (total === 0) {
    return 0
  }
  return (check.passes / total) * 100
}
