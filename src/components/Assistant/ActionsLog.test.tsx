import { Theme } from '@radix-ui/themes'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

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

describe('ActionsLog', () => {
  it('shows the typing dots while pending', () => {
    renderLog(true)

    expect(screen.getByLabelText('Working')).toBeDefined()
  })

  it('hides the typing dots when not pending', () => {
    renderLog(false)

    expect(screen.queryByLabelText('Working')).toBeNull()
  })
})
