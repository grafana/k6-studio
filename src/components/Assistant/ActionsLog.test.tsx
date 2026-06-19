import { Theme } from '@radix-ui/themes'
import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ActionsLog } from './ActionsLog'
import { ActionLogEntry } from './types'

const entries: ActionLogEntry[] = [
  { id: '1', type: 'info', text: 'Replaying recording', timestamp: 0 },
]

function renderLog(pending: boolean) {
  return render(
    <Theme>
      <ActionsLog entries={entries} pending={pending} />
    </Theme>
  )
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('ActionsLog', () => {
  it('shows the typing dots after a pause while pending', () => {
    renderLog(true)

    // Hidden during the initial streaming window.
    expect(screen.queryByLabelText('Working')).toBeNull()

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(screen.getByLabelText('Working')).toBeDefined()
  })

  it('never shows the typing dots when not pending', () => {
    renderLog(false)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.queryByLabelText('Working')).toBeNull()
  })
})
