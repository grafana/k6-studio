import { describe, expect, it } from 'vitest'

import {
  generateThresholds,
  generateCloudOptions,
  generateLoadZones,
} from './options.shared'

describe('generateThresholds', () => {
  it('returns empty record for empty input', () => {
    expect(generateThresholds([])).toEqual({})
  })

  it('skips disabled thresholds', () => {
    const out = generateThresholds([
      {
        id: '1',
        metric: 'http_req_duration',
        statistic: 'avg',
        condition: '<',
        value: 100,
        stopTest: false,
        enabled: false,
      },
      {
        id: '2',
        metric: 'http_req_failed',
        statistic: 'rate',
        condition: '<',
        value: 0.01,
        stopTest: false,
        enabled: true,
      },
    ])

    expect(out).toEqual({ http_req_failed: ['rate<0.01'] })
  })

  it('groups thresholds by metric', () => {
    const out = generateThresholds([
      {
        id: '1',
        metric: 'http_req_duration',
        statistic: 'avg',
        condition: '<',
        value: 100,
        stopTest: false,
      },
      {
        id: '2',
        metric: 'http_req_duration',
        statistic: 'p(95)',
        condition: '<',
        value: 200,
        stopTest: false,
      },
      {
        id: '3',
        metric: 'http_reqs',
        statistic: 'count',
        condition: '>',
        value: 10,
        stopTest: false,
      },
    ])
    expect(out).toEqual({
      http_req_duration: ['avg<100', 'p(95)<200'],
      http_reqs: ['count>10'],
    })
  })

  it('emits abortable threshold when stopTest is true', () => {
    const out = generateThresholds([
      {
        id: '1',
        metric: 'http_req_duration',
        statistic: 'avg',
        condition: '<',
        value: 100,
        stopTest: true,
      },
    ])
    expect(out).toEqual({
      http_req_duration: [{ threshold: 'avg<100', abortOnFail: true }],
    })
  })
})

describe('generateCloudOptions', () => {
  it('returns empty object when no zones', () => {
    expect(
      generateCloudOptions({ loadZones: { distribution: 'even', zones: [] } })
    ).toEqual({})
  })

  it('emits cloud.distribution when zones present', () => {
    const out = generateCloudOptions({
      loadZones: {
        distribution: 'manual',
        zones: [
          { id: '1', loadZone: 'amazon:us:columbus', percent: 60 },
          { id: '2', loadZone: 'amazon:de:frankfurt', percent: 40 },
        ],
      },
    })
    expect(out).toEqual({
      cloud: {
        distribution: {
          "'amazon:us:columbus'": {
            loadZone: 'amazon:us:columbus',
            percent: 60,
          },
          "'amazon:de:frankfurt'": {
            loadZone: 'amazon:de:frankfurt',
            percent: 40,
          },
        },
      },
    })
  })
})

describe('generateLoadZones', () => {
  it('keys output by quoted load zone literal', () => {
    expect(
      generateLoadZones([
        { id: '1', loadZone: 'amazon:us:columbus', percent: 100 },
      ])
    ).toEqual({
      "'amazon:us:columbus'": { loadZone: 'amazon:us:columbus', percent: 100 },
    })
  })
})
