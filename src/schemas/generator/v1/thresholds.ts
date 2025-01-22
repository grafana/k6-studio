import { z } from 'zod'

export const ThresholdMetric = z.enum([
  'http_req_duration',
  'http_reqs',
  'http_req_failed',
  'http_req_connecting',
  'http_req_tls_handshaking',
  'load_generator_memory_used_percent',
  'load_generator_cpu_percent',
  'data_sent',
  'data_received',
  'http_req_receiving',
  'http_req_blocked',
  'http_req_waiting',
  'iteration_duration',
])

export const ThresholdCondition = z.enum(['<', '<=', '>', '>=', '===', '!=='])

export const ThresholdStatistic = z.enum([
  'count',
  'rate',
  'value',
  'p(99)',
  'p(95)',
  'p(90)',
  'p(50)',
  'avg',
  'max',
  'min',
])

export const ThresholdSchema = z.object({
  id: z.string(),
  metric: ThresholdMetric,
  url: z.string().optional(),
  statistic: ThresholdStatistic,
  condition: ThresholdCondition,
  value: z.number(),
  stopTest: z.boolean().default(false),
})
