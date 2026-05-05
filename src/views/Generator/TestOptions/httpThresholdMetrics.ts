import {
  createMetricsConfig,
  MetricMeta,
} from '@/components/TestOptions/Thresholds/createMetricsConfig'
import { ThresholdMetric } from '@/types/testOptions'

const HTTP_METRICS_MAP: Record<ThresholdMetric, MetricMeta> = {
  http_req_duration: { label: 'Response time', unit: 'ms', type: 'trend' },
  http_reqs: { label: 'Request rate', unit: 'reqs', type: 'counter' },
  http_req_failed: { label: 'Failed requests', unit: '', type: 'rate' },
  http_req_connecting: { label: 'Connecting', unit: 'ms', type: 'trend' },
  http_req_tls_handshaking: {
    label: 'TLS handshaking',
    unit: 'ms',
    type: 'trend',
  },
  data_sent: { label: 'Data sent', unit: 'bytes', type: 'counter' },
  data_received: { label: 'Data received', unit: 'bytes', type: 'counter' },
  http_req_receiving: { label: 'Receiving', unit: 'ms', type: 'trend' },
  http_req_blocked: { label: 'Blocked', unit: 'ms', type: 'trend' },
  http_req_waiting: { label: 'Waiting', unit: 'ms', type: 'trend' },
  iteration_duration: {
    label: 'Iteration duration',
    unit: 'ms',
    type: 'trend',
  },
}

export const HTTP_METRICS_CONFIG = createMetricsConfig(HTTP_METRICS_MAP)
