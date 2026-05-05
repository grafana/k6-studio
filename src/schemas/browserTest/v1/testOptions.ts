import { z } from 'zod'

import { LoadZoneSchema } from '@/schemas/generator/v2/loadZone'
import { LoadProfileExecutorOptionsSchema } from '@/schemas/generator/v2/testOptions'
import {
  ThresholdConditionSchema,
  ThresholdStatisticSchema,
} from '@/schemas/generator/v2/thresholds'

export const BrowserThresholdMetricSchema = z.enum([
  'browser_data_sent',
  'browser_data_received',
  'browser_http_req_duration',
  'browser_http_req_failed',
  'browser_web_vital_lcp',
  'browser_web_vital_fcp',
  'browser_web_vital_cls',
  'browser_web_vital_inp',
  'browser_web_vital_ttfb',
  'iteration_duration',
  'checks',
])

export const BrowserThresholdSchema = z.object({
  id: z.string(),
  metric: BrowserThresholdMetricSchema,
  statistic: ThresholdStatisticSchema,
  condition: ThresholdConditionSchema,
  value: z
    .number({ message: 'Invalid value' })
    .min(0, { message: 'Invalid value' }),
  stopTest: z.boolean().default(false),
})

export const BrowserThresholdDataSchema = z.object({
  thresholds: z.array(BrowserThresholdSchema),
})

export const BrowserTestOptionsSchema = z.object({
  loadProfile: LoadProfileExecutorOptionsSchema,
  thresholds: z.array(BrowserThresholdSchema).default([]),
  cloud: z
    .object({
      loadZones: LoadZoneSchema,
    })
    .default({ loadZones: { distribution: 'even', zones: [] } }),
})

export type BrowserTestOptions = z.infer<typeof BrowserTestOptionsSchema>
export type BrowserThreshold = z.infer<typeof BrowserThresholdSchema>
export type BrowserThresholdMetric = z.infer<
  typeof BrowserThresholdMetricSchema
>

export const defaultBrowserTestOptions: BrowserTestOptions = {
  loadProfile: {
    executor: 'shared-iterations',
  },
  thresholds: [],
  cloud: { loadZones: { distribution: 'even', zones: [] } },
}
