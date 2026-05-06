import {
  createMetricsConfig,
  MetricMeta,
} from '@/components/TestOptions/Thresholds/createMetricsConfig'
import { BrowserThresholdMetric } from '@/schemas/browserTest'

const BROWSER_METRICS_MAP: Record<BrowserThresholdMetric, MetricMeta> = {
  browser_data_sent: { label: 'Data sent', unit: 'bytes', type: 'counter' },
  browser_data_received: {
    label: 'Data received',
    unit: 'bytes',
    type: 'counter',
  },
  browser_http_req_duration: {
    label: 'Request duration',
    unit: 'ms',
    type: 'trend',
  },
  browser_http_req_failed: { label: 'Failed requests', unit: '', type: 'rate' },
  browser_web_vital_lcp: {
    label: 'LCP (Largest Contentful Paint)',
    unit: 'ms',
    type: 'trend',
  },
  browser_web_vital_fcp: {
    label: 'FCP (First Contentful Paint)',
    unit: 'ms',
    type: 'trend',
  },
  browser_web_vital_cls: {
    label: 'CLS (Cumulative Layout Shift)',
    unit: '',
    type: 'trend',
  },
  browser_web_vital_inp: {
    label: 'INP (Interaction to Next Paint)',
    unit: 'ms',
    type: 'trend',
  },
  browser_web_vital_ttfb: {
    label: 'TTFB (Time to First Byte)',
    unit: 'ms',
    type: 'trend',
  },
  iteration_duration: {
    label: 'Iteration duration',
    unit: 'ms',
    type: 'trend',
  },
  checks: { label: 'Checks', unit: '%', type: 'rate' },
}

export const BROWSER_METRICS_CONFIG = createMetricsConfig(BROWSER_METRICS_MAP)
