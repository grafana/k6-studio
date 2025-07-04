import { describe, expect, it } from 'vitest'

import { UsageEventName } from './types'

describe('UsageTracker', () => {
  describe('UsageEventName', () => {
    const PREFIX = 'grafana_k6_studio'
    const snakeCase = /^[a-z0-9]+(_[a-z0-9]+)*$/

    it('all values start with the correct prefix and are in snake case', () => {
      Object.values(UsageEventName).forEach((value) => {
        expect(value.startsWith(PREFIX)).toBe(true)
        expect(snakeCase.test(value)).toBe(true)
      })
    })
  })
})
