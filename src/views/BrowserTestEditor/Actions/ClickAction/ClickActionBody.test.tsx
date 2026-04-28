import { Theme } from '@radix-ui/themes'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { HighlightSelectorProvider } from '@/components/HighlightSelectorProvider'
import { LocatorClickAction } from '@/main/runner/schema'
import { buildClickAction } from '@/test/factories/browserActions'

import { WithEditorMetadata } from '../../types'

import { ClickActionBody } from './ClickActionBody'

type ClickAction = WithEditorMetadata<LocatorClickAction>

function renderBody(
  action: ClickAction,
  onChange: (action: ClickAction) => void = vi.fn()
) {
  return render(
    <Theme>
      <HighlightSelectorProvider>
        <ClickActionBody action={action} onChange={onChange} />
      </HighlightSelectorProvider>
    </Theme>
  )
}

describe('ClickActionBody', () => {
  it('renders "Left" in the button selector when options are undefined', () => {
    renderBody(buildClickAction())

    expect(screen.getByRole('combobox').textContent).toContain('Left')
    expect(screen.getByText('click on')).toBeDefined()
  })

  it('renders "Middle" when options.button is "middle"', () => {
    renderBody(buildClickAction({ options: { button: 'middle' } }))

    expect(screen.getByRole('combobox').textContent).toContain('Middle')
  })

  it('renders "Right" when options.button is "right"', () => {
    renderBody(buildClickAction({ options: { button: 'right' } }))

    expect(screen.getByRole('combobox').textContent).toContain('Right')
  })

  it('writes options.button to onChange when a new button is selected', () => {
    const handleChange = vi.fn<(action: ClickAction) => void>()
    renderBody(buildClickAction(), handleChange)

    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)

    const rightOption = screen.getByRole('option', { name: 'Right' })
    fireEvent.click(rightOption)

    const updated = handleChange.mock.lastCall?.[0]
    expect(updated?.options?.button).toBe('right')
  })

  it('preserves modifiers already present on options', () => {
    const handleChange = vi.fn<(action: ClickAction) => void>()
    renderBody(
      buildClickAction({ options: { button: 'left', modifiers: ['Shift'] } }),
      handleChange
    )

    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)

    const middleOption = screen.getByRole('option', { name: 'Middle' })
    fireEvent.click(middleOption)

    const updated = handleChange.mock.lastCall?.[0]
    expect(updated?.options?.button).toBe('middle')
    expect(updated?.options?.modifiers).toEqual(['Shift'])
  })
})
