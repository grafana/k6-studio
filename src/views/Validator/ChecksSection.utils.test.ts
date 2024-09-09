import { describe, expect, it } from 'vitest'

import {
  getPassPercentage,
  groupChecksByPath,
  hasFailures,
} from './ChecksSection.utils'
import { K6Check } from '@/types'

function buildCheck(data?: Partial<K6Check>) {
  return {
    id: self.crypto.randomUUID(),
    name: 'test check',
    passes: 0,
    fails: 0,
    path: '',
    ...data,
  }
}

describe('Checks Section - utils', () => {
  describe('getPassPercentage', () => {
    it('should return the percentage of passes in a check', () => {
      const check = buildCheck({ passes: 30, fails: 20 })
      const actual = getPassPercentage(check)
      const expected = 60
      expect(actual).toEqual(expected)
    })
  })

  describe('groupChecksByPath', () => {
    it('should group checks by path', () => {
      const check1 = buildCheck({ path: '::check1' })
      const check2 = buildCheck({ path: '::check2' })
      const check3 = buildCheck({ path: '::group1::check3' })
      const check4 = buildCheck({ path: '::group2::check4' })
      const check5 = buildCheck({ path: '::group2::subgroup::check5' })

      const groupedChecks = groupChecksByPath([
        check1,
        check2,
        check3,
        check4,
        check5,
      ])

      const expected = {
        default: [check1, check2],
        group1: [check3],
        group2: [check4],
        'group2::subgroup': [check5],
      }

      expect(groupedChecks).toMatchObject(expected)
    })
  })

  describe('hasFailures', () => {
    it('should return true when the check has fails', () => {
      const check = buildCheck({ fails: 1 })
      expect(hasFailures(check)).toBeTruthy()
    })

    it('should return false when the check has no fails', () => {
      const check = buildCheck({ fails: 0 })
      expect(hasFailures(check)).toBeFalsy()
    })
  })
})
