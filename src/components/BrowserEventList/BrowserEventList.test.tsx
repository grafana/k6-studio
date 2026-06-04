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
  it('marks an element captured inside an iframe with the frame in its badge', () => {
    const event = clickEvent([{ selectors: { css: 'iframe#outer' } }])

    const { getByLabelText, getByText } = renderList(event, vi.fn())

    expect(getByLabelText('Inside iframe')).toBeTruthy()
    expect(getByText('iframe#outer')).toBeTruthy()
  })

  it('shows no iframe marker for a top-frame event', () => {
    const event = clickEvent(undefined)

    const { queryByLabelText } = renderList(event, vi.fn())

    expect(queryByLabelText('Inside iframe')).toBeNull()
  })
})
