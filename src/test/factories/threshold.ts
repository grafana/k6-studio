import { Threshold } from '@/types/thresholds'

export function createThreshold(threshold?: Partial<Threshold>): Threshold {
  return {
    id: crypto.randomUUID(),
    url: '*',
    metric: 'http_req_duration',
    statistic: 'avg',
    condition: '>',
    value: 0,
    stopTest: false,
    ...threshold,
  }
}
