import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { BrowserEvent, ClickEvent } from '@/schemas/recording'
import { RecordingContext } from '@/views/Recorder/RecordingContext'

import { BrowserEventList } from './BrowserEventList'

function clickEvent(frames?: ClickEvent['frames']): BrowserEvent {
  return {
    type: 'click',
    eventId: 'event-1',
    timestamp: 1,
    tab: 'tab-1',
    target: { selectors: { css: '#checkout-button' } },
    button: 'left',
    modifiers: { ctrl: false, shift: false, alt: false, meta: false },
    frames,
  }
}

function renderList(event: BrowserEvent, onHighlight: () => void) {
  return render(
    <RecordingContext recording>
      <BrowserEventList
        events={[event]}
        onNavigate={vi.fn()}
        onHighlight={onHighlight}
      />
    </RecordingContext>
  )
}

describe('BrowserEventList highlighting', () => {
  it('forwards the iframe frame chain when an in-iframe event is hovered', () => {
    const onHighlight = vi.fn()
    const event = clickEvent([{ selectors: { css: '#checkout' } }])

    const { getByText } = renderList(event, onHighlight)

    const locator = getByText('#checkout-button').closest('div')

    if (locator === null) {
      throw new Error('locator element not found')
    }

    fireEvent.mouseEnter(locator)

    expect(onHighlight).toHaveBeenCalledWith(
      { type: 'css', selector: '#checkout-button' },
      [
        {
          current: 'css',
          values: { css: { type: 'css', selector: '#checkout' } },
        },
      ]
    )
  })

  it('passes no frames for a top-frame event', () => {
    const onHighlight = vi.fn()
    const event = clickEvent(undefined)

    const { getByText } = renderList(event, onHighlight)

    const locator = getByText('#checkout-button').closest('div')

    if (locator === null) {
      throw new Error('locator element not found')
    }

    fireEvent.mouseEnter(locator)

    expect(onHighlight).toHaveBeenCalledWith(
      { type: 'css', selector: '#checkout-button' },
      undefined
    )
  })
})

describe('BrowserEventList iframe indicator', () => {
  it('shows the element first, then each frame innermost-first joined by "in"', () => {
    // frames are stored outermost-first; the badge reads element-first.
    const event = clickEvent([
      { selectors: { css: 'iframe#outer' } },
      { selectors: { css: 'iframe#inner' } },
    ])

    const { getAllByLabelText, getByText } = renderList(event, vi.fn())

    const badge = getByText('#checkout-button').closest('div')

    if (badge === null) {
      throw new Error('locator badge not found')
    }

    expect(getAllByLabelText('iframe')).toHaveLength(2)
    expect(badge.textContent).toMatch(
      /#checkout-button.*in.*iframe#inner.*in.*iframe#outer/
    )
  })

  it('collapses to a frame count when the chain is deep', () => {
    const event = clickEvent([
      { selectors: { css: 'iframe#a' } },
      { selectors: { css: 'iframe#b' } },
      { selectors: { css: 'iframe#c' } },
    ])

    const { getByText, queryByText, queryByLabelText } = renderList(
      event,
      vi.fn()
    )

    expect(getByText(/in 3 frames/)).toBeTruthy()
    expect(queryByText('iframe#a')).toBeNull()
    expect(queryByLabelText('iframe')).toBeNull()
  })

  it('shows no frame suffix for a top-frame event', () => {
    const event = clickEvent(undefined)

    const { getByText, queryByLabelText } = renderList(event, vi.fn())

    expect(getByText('#checkout-button')).toBeTruthy()
    expect(queryByLabelText('iframe')).toBeNull()
  })
})
