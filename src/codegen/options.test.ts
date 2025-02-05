import { describe, expect, it } from 'vitest'

import { generateOptions, generateThresholds } from './options'
import { LoadProfileExecutorOptions, TestOptions } from '@/types/testOptions'
import { Threshold } from '@/types/thresholds'
import { createThreshold } from '@/test/factories/threshold'

describe('Code generation - options', () => {
  it('should generate load profile for shared-iterations executor', () => {
    const loadProfile: LoadProfileExecutorOptions = {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 1,
    }

    const expectedResult = `{
      vus: 1,
      iterations: 1
    }`

    expect(
      generateOptions({ loadProfile } as TestOptions, []).replace(/\s/g, '')
    ).toBe(expectedResult.replace(/\s/g, ''))
  })

  it('should generate load profile for ramping-vus executor', () => {
    const loadProfile: LoadProfileExecutorOptions = {
      executor: 'ramping-vus',
      stages: [
        {
          duration: '1',
          target: 1,
        },
      ],
    }

    const expectedResult = `{
      stages: [
        {
          duration: '1',
          target: 1
        }
      ]
    }`

    expect(
      generateOptions({ loadProfile } as TestOptions, []).replace(/\s/g, '')
    ).toBe(expectedResult.replace(/\s/g, ''))
  })
})

describe('Code generation - thresholds', () => {
  it('should generate thresholds correctly', () => {
    const thresholds: Threshold[] = [
      createThreshold({
        metric: 'http_req_duration',
        url: '*',
        statistic: 'p(95)',
        condition: '<',
        value: 200,
        stopTest: false,
      }),
      createThreshold({
        metric: 'http_req_duration',
        url: 'https://example.com',
        statistic: 'p(99)',
        condition: '<',
        value: 300,
        stopTest: true,
      }),
      createThreshold({
        metric: 'http_req_failed',
        url: 'https://example.com',
        statistic: 'rate',
        condition: '==',
        value: 100,
        stopTest: true,
      }),
    ]

    const expectedResult = {
      http_req_duration: ['p(95)<200'],
      "'http_req_duration{url:https://example.com}'": [
        { threshold: 'p(99)<300', abortOnFail: true },
      ],
      "'http_req_failed{url:https://example.com}'": [
        {
          abortOnFail: true,
          threshold: 'rate==100',
        },
      ],
    }

    expect(generateThresholds(thresholds)).toEqual(expectedResult)
  })

  it('should handle multiple thresholds for the same metric', () => {
    const thresholds: Threshold[] = [
      createThreshold({
        metric: 'http_req_duration',
        url: '*',
        statistic: 'p(95)',
        condition: '<',
        value: 200,
        stopTest: false,
      }),
      createThreshold({
        metric: 'http_req_duration',
        url: '*',
        statistic: 'p(99)',
        condition: '<',
        value: 300,
        stopTest: true,
      }),
    ]

    const expectedResult = {
      http_req_duration: [
        'p(95)<200',
        { threshold: 'p(99)<300', abortOnFail: true },
      ],
    }

    expect(generateThresholds(thresholds)).toEqual(expectedResult)
  })
})
