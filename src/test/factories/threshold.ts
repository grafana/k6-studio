import { Threshold } from '@/types/testOptions'

export function createThreshold(threshold?: Partial<Threshold>): Threshold {
  return {
    id: crypto.randomUUID(),
    metric: 'http_req_duration',
    statistic: 'avg',
    condition: '>',
    value: 0,
    stopTest: false,
    ...threshold,
  }
}
