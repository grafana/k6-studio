import { K6Check } from '@/types'

export function groupChecksByPath(checks: K6Check[]) {
  const result: Record<string, K6Check[]> = {
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

export function hasFailures(check: K6Check) {
  return check.fails > 0
}

export function getPassPercentage(check: K6Check) {
  const total = check.passes + check.fails
  return (check.passes / total) * 100
}
