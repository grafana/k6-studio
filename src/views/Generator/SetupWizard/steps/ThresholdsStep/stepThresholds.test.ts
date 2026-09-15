import { describe, expect, it } from 'vitest'

import { Threshold } from '@/types/testOptions'

import { mergeShownThresholds, partitionThresholds } from './stepThresholds'

function createThreshold(id: string): Threshold {
  return {
    id,
    metric: 'http_req_duration',
    statistic: 'p(95)',
    condition: '<',
    value: 300,
    stopTest: false,
    enabled: true,
  }
}

describe('partitionThresholds', () => {
  it('splits pre-existing rows from the ones the step owns', () => {
    const preexisting = createThreshold('pre-1')
    const suggested = createThreshold('suggested-1')
    const added = createThreshold('added-1')

    const result = partitionThresholds(
      [preexisting, suggested, added],
      ['pre-1']
    )

    expect(result.shown).toEqual([suggested, added])
    expect(result.preexisting).toEqual([preexisting])
  })
})

describe('mergeShownThresholds', () => {
  it('keeps hidden pre-existing rows when the shown rows change', () => {
    const preexisting = createThreshold('pre-1')
    const suggested = createThreshold('suggested-1')
    const edited = { ...suggested, value: 500 }

    const merged = mergeShownThresholds(
      [preexisting, suggested],
      ['pre-1'],
      [edited]
    )

    expect(merged).toEqual([preexisting, edited])
  })

  it('drops a removed shown row without touching pre-existing ones', () => {
    const preexisting = createThreshold('pre-1')
    const added = createThreshold('added-1')

    const merged = mergeShownThresholds([preexisting, added], ['pre-1'], [])

    expect(merged).toEqual([preexisting])
  })
})
