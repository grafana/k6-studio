import { Check } from '@/schemas/k6'

export function createK6Check(check?: Partial<Check>): Check {
  return {
    id: '1',
    name: 'Check',
    path: 'path',
    passes: 1,
    fails: 0,
    ...check,
  }
}
