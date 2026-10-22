import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useActionsLog } from './useActionsLog'

describe('markLastReasoningAsOutcome', () => {
  it.each(['outcome-success', 'outcome-partial', 'outcome-failure'] as const)(
    'does not append an empty %s entry when no reasoning text exists',
    (outcome) => {
      const { result } = renderHook(useActionsLog)
      act(() => {
        result.current.addEntry({ type: 'info', text: 'Analyzing requests' })
        result.current.addEntry({
          type: 'thinking',
          text: 'Choosing thresholds',
        })
      })
      const entries = result.current.entries

      act(() => result.current.markLastReasoningAsOutcome(outcome))

      expect(result.current.entries).toBe(entries)
    }
  )

  it('leaves results unhighlighted when the assistant provided no explanation', () => {
    const { result } = renderHook(useActionsLog)
    act(() => {
      result.current.addEntry({ type: 'thinking', text: 'Choosing thresholds' })
      result.current.addEntry({
        type: 'found',
        text: 'Suggested **3 thresholds**',
      })
    })
    act(() => result.current.markLastReasoningAsOutcome('outcome-success'))
    expect(result.current.entries).toHaveLength(2)
    expect(result.current.entries[1]).toMatchObject({
      type: 'found',
      text: 'Suggested **3 thresholds**',
    })
  })

  it('marks the last reasoning entry and preserves its text', () => {
    const { result } = renderHook(useActionsLog)
    act(() => {
      result.current.addEntry({ type: 'reasoning', text: 'Starting analysis' })
      result.current.addEntry({ type: 'found', text: 'Suggested 3 thresholds' })
      result.current.addEntry({
        type: 'reasoning',
        text: 'Thresholds are ready',
      })
    })
    const entries = result.current.entries

    act(() => result.current.markLastReasoningAsOutcome('outcome-success'))

    expect(result.current.entries).toEqual([
      entries[0],
      entries[1],
      { ...entries[2], type: 'outcome-success' },
    ])
  })
})
