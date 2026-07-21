import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { mockMatchMedia } from '@/test/utils/mockMatchMedia'

import { TimelineSlider } from './TimelineSlider'
import { Time } from '../types'

function StatefulTimelineSlider({
  onSeek,
}: {
  onSeek: (time: number, commit: boolean) => void
}) {
  const [time, setTime] = useState<Time>({
    start: 0,
    end: 10,
    current: 0,
    total: 10,
  })

  return (
    <TimelineSlider
      time={time}
      actions={[]}
      onSeek={(nextTime, commit) => {
        setTime((current) => ({ ...current, current: nextTime }))
        onSeek(nextTime, commit)
      }}
    />
  )
}

function renderSlider(onSeek = vi.fn()) {
  mockMatchMedia(false)

  render(<StatefulTimelineSlider onSeek={onSeek} />)

  const slider = screen.getByRole('slider', { name: 'Timeline position' })

  slider.getBoundingClientRect = () =>
    ({
      left: 0,
      top: 0,
      right: 100,
      bottom: 20,
      width: 100,
      height: 20,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }) as DOMRect

  slider.setPointerCapture = vi.fn()
  slider.hasPointerCapture = vi.fn(() => true)
  slider.releasePointerCapture = vi.fn()

  return {
    onSeek,
    slider,
  }
}

describe('TimelineSlider seek commits', () => {
  it('commits keyboard timeline moves immediately', () => {
    const onSeek = vi.fn()
    const { slider } = renderSlider(onSeek)

    slider.focus()
    fireEvent.keyDown(slider, { key: 'ArrowRight' })

    expect(onSeek).toHaveBeenCalled()
    expect(onSeek.mock.calls.at(-1)).toEqual([expect.any(Number), true])
  })
})
