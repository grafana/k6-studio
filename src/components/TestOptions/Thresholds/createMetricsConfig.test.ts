import { describe, expect, it } from 'vitest'

import { createMetricsConfig } from './createMetricsConfig'

describe('createMetricsConfig', () => {
  const config = createMetricsConfig({
    response_time: { label: 'Response time', unit: 'ms', type: 'trend' },
    request_count: { label: 'Request count', unit: 'reqs', type: 'counter' },
    error_rate: { label: 'Error rate', unit: '', type: 'rate' },
  })

  it('returns options keyed by metric value', () => {
    expect(config.options).toEqual([
      { value: 'response_time', label: 'Response time' },
      { value: 'request_count', label: 'Request count' },
      { value: 'error_rate', label: 'Error rate' },
    ])
  })

  it('returns trend statistics for trend metrics', () => {
    const opts = config.getStatisticOptions('response_time')
    expect(opts.map((o) => o.value)).toEqual([
      'p(99)',
      'p(95)',
      'p(90)',
      'p(50)',
      'avg',
      'max',
      'min',
    ])
  })

  it('returns count for counter metrics', () => {
    const opts = config.getStatisticOptions('request_count')
    expect(opts).toEqual([{ label: 'Count', value: 'count' }])
  })

  it('returns rate for rate metrics', () => {
    const opts = config.getStatisticOptions('error_rate')
    expect(opts).toEqual([{ label: 'Rate', value: 'rate' }])
  })

  it('returns metric unit', () => {
    expect(config.getMetricUnit('response_time')).toBe('ms')
    expect(config.getMetricUnit('error_rate')).toBe('')
  })
})
