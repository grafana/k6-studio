import { ThresholdMetricSchema } from '@/schemas/generator'
import { ThresholdMetric } from '@/types/thresholds'
import { exhaustive } from '@/utils/typescript'

type ThresholdMetricMap = {
  label: string
  unit: '' | 'ms' | 'reqs' | 'bytes' | '%'
  type: 'trend' | 'counter' | 'rate' | 'gauge'
}

const metricsMap: Record<ThresholdMetric, ThresholdMetricMap> = {
  http_req_duration: {
    label: 'Response time',
    unit: 'ms',
    type: 'trend',
  },
  http_reqs: {
    label: 'Request rate',
    unit: 'reqs',
    type: 'counter',
  },
  http_req_failed: {
    label: 'Failed requests',
    unit: '',
    type: 'rate',
  },
  http_req_connecting: {
    label: 'Connecting',
    unit: 'ms',
    type: 'trend',
  },
  http_req_tls_handshaking: {
    label: 'TLS handshaking',
    unit: 'ms',
    type: 'trend',
  },
  load_generator_memory_used_percent: {
    label: 'Utilization - Memory',
    unit: '%',
    type: 'gauge',
  },
  load_generator_cpu_percent: {
    label: 'Utilization - CPU',
    unit: '%',
    type: 'gauge',
  },
  data_sent: {
    label: 'Data sent',
    unit: 'bytes',
    type: 'counter',
  },
  data_received: {
    label: 'Data received',
    unit: 'bytes',
    type: 'counter',
  },
  http_req_receiving: {
    label: 'Receiving',
    unit: 'ms',
    type: 'trend',
  },
  http_req_blocked: {
    label: 'Blocked',
    unit: 'ms',
    type: 'trend',
  },
  http_req_waiting: {
    label: 'Waiting',
    unit: 'ms',
    type: 'trend',
  },
  iteration_duration: {
    label: 'Iteration duration',
    unit: 'ms',
    type: 'trend',
  },
}

export const THRESHOLD_METRICS_OPTIONS = ThresholdMetricSchema.options.map(
  (value) => ({
    value,
    label: metricsMap[value].label,
  })
)

export const THRESHOLD_CONDITIONS_OPTIONS = [
  { label: '<', value: '<' },
  { label: '<=', value: '<=' },
  { label: '>', value: '>' },
  { label: '>=', value: '>=' },
  { label: '===', value: '===' },
  { label: '!==', value: '!==' },
]

export const getStatisticOptions = (metricName: ThresholdMetric) => {
  const { type } = metricsMap[metricName]

  switch (type) {
    case 'counter':
      return [{ label: 'Count', value: 'count' }]
    case 'rate':
      return [{ label: 'Rate', value: 'rate' }]
    case 'gauge':
      return [{ label: 'Value', value: 'value' }]
    case 'trend':
      return [
        { label: '99th percentile', value: 'p(99)' },
        { label: '95th percentile', value: 'p(95)' },
        { label: '90th percentile', value: 'p(90)' },
        { label: '50th percentile', value: 'p(50)' },
        { label: 'Mean', value: 'avg' },
        { label: 'Max', value: 'max' },
        { label: 'Min', value: 'min' },
      ]
    default:
      return exhaustive(type)
  }
}

export const getMetricUnit = (metricName: ThresholdMetric) => {
  return metricsMap[metricName].unit
}
