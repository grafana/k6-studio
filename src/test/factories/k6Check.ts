import { K6Check } from '@/types'

export function createK6Check(check?: Partial<K6Check>): K6Check {
  return {
    id: '1',
    name: 'Check',
    path: 'path',
    passes: 1,
    fails: 0,
    ...check,
  }
}
