import { z } from 'zod'

export const ThresholdMetricSchema = z.enum([
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

export const ThresholdConditionSchema = z.enum([
  '<',
  '<=',
  '>',
  '>=',
  '===',
  '!==',
])

export const ThresholdStatisticSchema = z.enum([
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
  metric: ThresholdMetricSchema,
  url: z.string().optional(),
  statistic: ThresholdStatisticSchema,
  condition: ThresholdConditionSchema,
  value: z.number({ message: 'Invalid value' }),
  stopTest: z.boolean().default(false),
})

export const ThresholdDataSchema = z.object({
  thresholds: z.array(ThresholdSchema),
})
